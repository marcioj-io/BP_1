import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { ModuleEnum, PrismaClient, RoleEnum } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { permissionsStructure } from 'src/modules/tenant/rules/tenant-rules';
import {
  getMainAssignmentFromModule,
  getRoleAllowedAssignments,
  getRoleThatCanCreateRole,
  getRolesThatGivenCanBeCreatedBy,
  getRolesWithAccessToModule,
} from 'src/modules/tenant/tenant.helper';
import {
  AssignmentsDto,
  RoleDto,
} from 'src/modules/user/dto/response/assignments.dto';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { EMAIL_TEST } from 'src/utils/test/constants';
import * as request from 'supertest';

import {
  generateTestUser,
  impersonateUser,
  removeUserTest,
} from './fixtures/user/user.test-utils';
import {
  getAssignmentsByName,
  getImpersonateInformations,
  getRoleId,
} from './shared/utils';

describe('Tenant module E2E Tests', () => {
  const prisma = new PrismaClient();
  let app: INestApplication;
  let jwtService: JwtService;

  let users: { [key: string]: UserEntity } = {};

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    const jwtServiceInjection = module.get<JwtService>(JwtService);

    jwtService = jwtServiceInjection;

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );

    await app.init();
  });

  beforeEach(async () => {
    await Promise.all(
      Object.values(RoleEnum).map(async role => {
        const roleId = await getRoleId(prisma, role);

        const permittedAssignments = getRoleAllowedAssignments(role);

        const firstAssignmentPermitted = permittedAssignments[0];

        const assignmentsIds = (
          await getAssignmentsByName(prisma, firstAssignmentPermitted)
        )?.map(assignment => assignment.id);

        const user = await generateTestUser(
          prisma,
          `${role}_${EMAIL_TEST}`,
          roleId,
          assignmentsIds,
        );

        users[role] = user;
      }),
    );
  });

  afterEach(async () => {
    await Promise.all(
      Object.values(users).map(async user => {
        await removeUserTest(prisma, user.email);
      }),
    );

    users = {};
  });

  afterAll(async () => {
    if (app) {
      await app.close();
      await prisma.$disconnect();
    }
  });

  describe('Get user system roles', () => {
    const endPointUrl = '/tenant/roles';

    describe('Module', () => {
      const randomModule = Object.keys(permissionsStructure.modules)[
        Math.floor(
          Math.random() * Object.keys(permissionsStructure.modules).length,
        )
      ];

      const assignmentModule = getMainAssignmentFromModule(
        randomModule as ModuleEnum,
      );

      it('Should throw error if module doesnt exist', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: 'INVALID_MODULE',
          })
          .expect(400);
      });

      it('Should throw error if module is not present in request', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .expect(400);
      });

      it('Should get data if user has permitted role on module', async () => {
        const getPermittedRoles = getRolesWithAccessToModule(
          randomModule as ModuleEnum,
        );

        const randomPermittedRole =
          getPermittedRoles[
            Math.floor(Math.random() * getPermittedRoles.length)
          ];

        const rolesThatCanBeCreatedByLoggedUser =
          getRolesThatGivenCanBeCreatedBy(randomPermittedRole);

        const filteredRolesToBeCreatedBy = getPermittedRoles.filter(role =>
          rolesThatCanBeCreatedByLoggedUser.includes(role),
        );

        const randomRoleToUse =
          filteredRolesToBeCreatedBy[
            Math.floor(Math.random() * filteredRolesToBeCreatedBy.length)
          ];

        if (randomRoleToUse.length === 0) {
          // If system has only one role, it will not be possible to test this scenario
          expect(true).toBeTruthy();
          return;
        }

        const { email, id, role } = getImpersonateInformations(
          randomRoleToUse,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: randomModule,
          })
          .expect(200);
      });

      it('Should throw error if module is not acessible by logged user role', async () => {
        const getPermittedRoles = getRolesWithAccessToModule(
          randomModule as ModuleEnum,
        );

        const userThatIsNotPermitted = Object.values(users).find(
          user => !getPermittedRoles.includes(user.Role.name as RoleEnum),
        );

        if (!userThatIsNotPermitted) {
          // If system has only one role, it will not be possible to test this scenario
          expect(true).toBeTruthy();
          return;
        }

        const { email, id, role } = getImpersonateInformations(
          userThatIsNotPermitted.Role.name as RoleEnum,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: randomModule,
          })
          .expect(403);
      });
    });

    describe('[Module] [Admin]', () => {
      const currentModule = ModuleEnum.ADMIN;

      const assignmentModule = getMainAssignmentFromModule(
        currentModule as ModuleEnum,
      );

      it('Should get data if user has assignment of update on USER assignment', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.USER,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const response = await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .expect(200);

        expect(response.body).toBeDefined();

        response.body.forEach((role: RoleDto) => {
          expect(role.id).toBeDefined();
          expect(role.name).toBeDefined();
        });
      });

      it('Should get data if user has assignment of create on USER assignment', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.USER,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: false,
              delete: false,
            },
          ],
        });

        const response = await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .expect(200);

        expect(response.body).toBeDefined();

        response.body.forEach((role: RoleDto) => {
          expect(role.id).toBeDefined();
          expect(role.name).toBeDefined();
        });
      });

      it('Should throw error if user has not create or update USER assignment', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.USER,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: false,
              update: false,
              delete: false,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .expect(403);
      });

      it('Every role return must be in complience with roles with access to module', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.USER,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const response = await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .expect(200);

        const fetchRolesWithAccessToModule = getRolesWithAccessToModule(
          currentModule as ModuleEnum,
        );

        response.body.forEach((role: RoleDto) =>
          expect(fetchRolesWithAccessToModule).toContain(role.name),
        );
      });
    });
  });

  describe('Get user system assignments', () => {
    const endPointUrl = '/tenant/assignments';

    describe('Module', () => {
      const randomModule = Object.keys(permissionsStructure.modules)[
        Math.floor(
          Math.random() * Object.keys(permissionsStructure.modules).length,
        )
      ];

      const assignmentModule = getMainAssignmentFromModule(
        randomModule as ModuleEnum,
      );

      const rolesWithAccessToModule = getRolesWithAccessToModule(
        randomModule as ModuleEnum,
      );

      it('Should throw error if module doesnt exist', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: 'INVALID_MODULE',
          })
          .expect(400);
      });

      it('Should throw error if module is not present in request', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
        );

        const roleId = await getRoleId(prisma, rolesWithAccessToModule[0]);

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: false,
              update: false,
              delete: false,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            role: roleId,
          })
          .expect(400);
      });

      it('Should throw error if role is not present in request', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: randomModule,
          })
          .expect(400);
      });

      it('Should throw not found exception if role is doesnt exist', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: randomModule,
            role: 'INVALID_ROLE',
          })
          .expect(400);
      });

      it('Should get data if user has permitted role on module', async () => {
        const randomRole =
          rolesWithAccessToModule[
            Math.floor(Math.random() * rolesWithAccessToModule.length)
          ];

        const roleToGetAssignemnts = await getRoleId(prisma, randomRole);

        const rolesThatCanCreateTheRoleOfGetAssignments =
          getRoleThatCanCreateRole(randomRole);

        const randomRoleThatCanCreateTheRoleOfGetAssignments =
          rolesThatCanCreateTheRoleOfGetAssignments[
            Math.floor(
              Math.random() * rolesThatCanCreateTheRoleOfGetAssignments.length,
            )
          ];

        const { email, id, role } = getImpersonateInformations(
          randomRoleThatCanCreateTheRoleOfGetAssignments,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: randomModule,
            role: roleToGetAssignemnts,
          })
          .expect(200);
      });

      it('Should throw error if module is not acessible by logged user role', async () => {
        const getPermittedRoles = getRolesWithAccessToModule(
          randomModule as ModuleEnum,
        );

        const userThatIsNotPermitted = Object.values(users).find(
          user => !getPermittedRoles.includes(user.Role.name as RoleEnum),
        );

        if (!userThatIsNotPermitted) {
          // If system has only one role, it will not be possible to test this scenario
          expect(true).toBeTruthy();
          return;
        }

        const { email, id, role } = getImpersonateInformations(
          userThatIsNotPermitted.Role.name as RoleEnum,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: randomModule,
            role: userThatIsNotPermitted.Role.id,
          })
          .expect(403);
      });
    });

    describe('[Module] [Admin]', () => {
      const currentModule = ModuleEnum.ADMIN;

      const assignmentModule = getMainAssignmentFromModule(
        currentModule as ModuleEnum,
      );

      it('Should get data if user has assignment of update on USER assignment', async () => {
        const impersonatedRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const response = await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
            role: users[impersonatedRole].Role.id,
          })
          .expect(200);

        expect(response.body).toBeDefined();

        response.body.forEach((assignment: AssignmentsDto) => {
          expect(assignment.id).toBeDefined();
          expect(assignment.name).toBeDefined();
        });
      });

      it('Should get data if user has assignment of create on USER assignment', async () => {
        const impersonatedRole = RoleEnum.USER;
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: false,
              delete: false,
            },
          ],
        });

        const response = await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
            role: users[impersonatedRole].Role.id,
          })
          .expect(200);

        expect(response.body).toBeDefined();

        response.body.forEach((assignment: AssignmentsDto) => {
          expect(assignment.id).toBeDefined();
          expect(assignment.name).toBeDefined();
        });
      });

      it('Should throw error if user has not create or update USER assignment', async () => {
        const impersonatedRole = RoleEnum.USER;
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: false,
              update: false,
              delete: false,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
            role: users[impersonatedRole].Role.id,
          })
          .expect(403);
      });

      it('Every role return must be in complience with roles with access to module', async () => {
        const impersonatedRole = RoleEnum.USER;
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const response = await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
            role: users[impersonatedRole].Role.id,
          })
          .expect(200);

        const fetchRolesWithAccessToModule = getRolesWithAccessToModule(
          currentModule as ModuleEnum,
        );

        response.body.forEach((role: RoleDto) =>
          expect(fetchRolesWithAccessToModule).toContain(role.name),
        );
      });
    });
  });
});
