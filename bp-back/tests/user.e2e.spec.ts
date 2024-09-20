import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  AssignmentsEnum,
  MethodEnum,
  ModuleEnum,
  PrismaClient,
  RoleEnum,
  StatusEnum,
} from '@prisma/client';
import { AppModule } from 'src/app.module';
import { permissionsStructure } from 'src/modules/tenant/rules/tenant-rules';
import {
  getMainAssignmentFromModule,
  getRoleAllowedAssignments,
  getRolesThatGivenCanBeCreatedBy,
  getRolesWithAccessToModule,
} from 'src/modules/tenant/tenant.helper';
import { UpdateUserPersonalData } from 'src/modules/user/dto/request/update.personal.data.dto';
import { UserRestrictionBody } from 'src/modules/user/dto/request/user.block.dto';
import { UserPaginationResponse } from 'src/modules/user/dto/response/user.pagination.response';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { EMAIL_TEST, EMAIL_TEST_TWO } from 'src/utils/test/constants';
import * as request from 'supertest';

import {
  generateCreateInput,
  generatePartialEntity,
  generateUpdateInput,
} from './fixtures/user/user.fixture.generator';
import {
  revertUserToInitialState,
  removeUserTest,
  changeUserStatus,
  impersonateUser,
  generateTestUser,
} from './fixtures/user/user.test-utils';
import { baseAuthenticationTests } from './shared/base.tests';
import {
  generateRandomStrings,
  getAssignmentsByName,
  getAssignmentsIds,
  getAssignmentsNames,
  getImpersonateInformations,
  getRoleId,
  getUserIdentifierByRoleAndIndex,
} from './shared/utils';
describe('User module E2E Tests', () => {
  // Pre create two users for each role to validate on tests
  const multipleUsers = 2;

  const prisma = new PrismaClient();
  let app: INestApplication;
  let jwtService: JwtService;
  let users: { [key: string]: UserEntity } = {};

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ThrottlerModule.forRoot([
          {
            limit: 9999,
            ttl: 30000,
          },
        ]),
      ],
    }).compile();

    const jwtServiceInjection = module.get<JwtService>(JwtService);

    jwtService = jwtServiceInjection;

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
      await prisma.$disconnect();
    }
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

        for (let index = 1; index <= multipleUsers; index++) {
          const user = await generateTestUser(
            prisma,
            `${role}_${index}_${EMAIL_TEST}`,
            roleId,
            assignmentsIds,
          );

          users[getUserIdentifierByRoleAndIndex(role, index)] = user;
        }
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

  describe('Get filtered users', () => {
    const endPointUrl = '/user';

    describe('[Module]', () => {
      const randomModule = Object.keys(permissionsStructure.modules)[
        Math.floor(
          Math.random() * Object.keys(permissionsStructure.modules).length,
        )
      ];

      const assignmentModule = getMainAssignmentFromModule(
        randomModule as ModuleEnum,
      );

      const impersonatedRole: RoleEnum = RoleEnum.USER;

      it('Should throw error if module doesnt exist', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
          1,
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
            module: 'INVALID_MODULE',
          })
          .expect(400);
      });

      it('Should throw error if module is not present in request', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
          1,
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
          .expect(400);
      });

      it('Should throw forbidden error if logged user doesnt have read permission', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: false,
              delete: false,
            },
          ],
        });

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: randomModule })
          .expect(403);
      });

      it('Should throw forbidden error if logged user doesnt have specified assignment', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              name: 'WRONG_ASSIGNMENT',
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
          .query({ module: randomModule })
          .expect(403);
      });
    });

    describe('[Module] [Admin]', () => {
      const currentModule = ModuleEnum.ADMIN;

      const assignmentModule = getMainAssignmentFromModule(
        currentModule as ModuleEnum,
      );

      it('Should get data', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.USER,
          users,
          1,
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

        const response = await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            page: 1,
            perPage: 10,
            orderBy: { id: 'desc' },
            module: currentModule,
          })
          .expect(200);

        expect(response.body).toBeDefined();

        expect(Array.isArray(response.body.data)).toBeTruthy();
        expect(response.body.data.length).toBeGreaterThan(0);

        if (response.body.data.length > 0) {
          const firstItem = response.body.data[0];
          expect(firstItem).toHaveProperty('id');
          expect(firstItem).toHaveProperty('email');
          expect(firstItem).toHaveProperty('name');
          expect(firstItem).toHaveProperty('status');
          expect(firstItem).toHaveProperty('blocked');
          expect(firstItem).toHaveProperty('role');
        }

        expect(response.body.meta).toBeDefined();
        expect(response.body.meta.total).toBeDefined();
        expect(response.body.meta.total).toBeGreaterThan(0);
        expect(response.body.meta.lastPage).toBeDefined();
        expect(response.body.meta.currentPage).toBeDefined();
        expect(response.body.meta.perPage).toBeDefined();
        expect(response.body.meta.prev).toBeDefined();
        expect(response.body.meta.next).toBeDefined();
      });

      it('Should get data with per page wrong', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.USER,
          users,
          1,
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

        const perPage = -1;
        const page = -1;

        const response = await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            page,
            perPage,
            orderBy: { id: 'desc' },
            module: currentModule,
          })
          .expect(200);

        expect(response.body.data).toBeDefined();
        expect(Array.isArray(response.body.data)).toBeTruthy();

        expect(response.body.data.length === Math.abs(perPage)).toBeTruthy();

        expect(response.body.meta).toBeDefined();
        expect(response.body.meta.total).toBeDefined();
        expect(response.body.meta.lastPage).toBeDefined();

        expect(response.body.meta.currentPage).toBeDefined();
        expect(response.body.meta.currentPage).toBe(page);

        expect(response.body.meta.perPage).toBeDefined();
        expect(response.body.meta.perPage).toBe(perPage);

        expect(response.body.meta.prev).toBeDefined();
        expect(response.body.meta.next).toBeDefined();
      });

      it('Every user should have the permitted role from the current module', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.USER,
          users,
          1,
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

        const getPermittedRolesFromSelectedModule: RoleEnum[] =
          getRolesWithAccessToModule(currentModule as ModuleEnum);

        const response = await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            page: 1,
            perPage: 10,
            orderBy: { id: 'desc' },
            module: currentModule,
          })
          .expect(200);

        expect(response.body).toBeDefined();

        expect(Array.isArray(response.body.data)).toBeTruthy();
        expect(response.body.data.length).toBeGreaterThan(0);

        response.body.data.forEach((user: UserPaginationResponse) => {
          expect(getPermittedRolesFromSelectedModule).toContain(user.role);
        });
      });

      it('Show throw error if user try to filter an user with different role on specified module', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.USER,
          users,
          1,
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

        const getPermittedRolesFromSelectedModule: RoleEnum[] =
          getRolesWithAccessToModule(currentModule as ModuleEnum);

        const roleThatIsNotPermitted = Object.values(users).find(
          user =>
            !getPermittedRolesFromSelectedModule.includes(
              user.Role.name as RoleEnum,
            ),
        )?.Role?.name;

        if (!roleThatIsNotPermitted) {
          // If system has only one role, it will not be possible to test this scenario
          expect(true).toBeTruthy();
          return;
        }

        await request(app.getHttpServer())
          .get(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            page: 1,
            perPage: 10,
            orderBy: { id: 'desc' },
            module: currentModule,
            search: roleThatIsNotPermitted,
          })
          .expect(403);
      });
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(`${endPointUrl}`, MethodEnum.GET, app);
    });
  });

  describe('Get user by id', () => {
    const endPointUrl = '/user';

    describe('[Module]', () => {
      const randomModule = Object.keys(permissionsStructure.modules)[
        Math.floor(
          Math.random() * Object.keys(permissionsStructure.modules).length,
        )
      ];

      const assignmentModule = getMainAssignmentFromModule(
        randomModule as ModuleEnum,
      );

      const impersonatedRole: RoleEnum = RoleEnum.USER;

      it('Should throw error if module doesnt exist', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
          1,
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

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .get(`${endPointUrl}/${targetUser}`)
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
          1,
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

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .get(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .expect(400);
      });

      it('Should throw forbidden error if logged user doesnt have read permission', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: false,
              delete: false,
            },
          ],
        });

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .get(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: randomModule })
          .expect(403);
      });

      it('Should throw forbidden error if logged user doesnt have specified assignment', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              name: 'WRONG_ASSIGNMENT',
              read: true,
              create: false,
              update: false,
              delete: false,
            },
          ],
        });

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .get(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: randomModule })
          .expect(403);
      });

      it('Should throw forbidden error if try to get user with different role on specified module', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
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

        const getPermittedRolesFromSelectedModule: RoleEnum[] =
          getRolesWithAccessToModule(randomModule as ModuleEnum);

        const userThatIsNotPermitted = Object.values(users).find(
          user =>
            !getPermittedRolesFromSelectedModule.includes(
              user.Role.name as RoleEnum,
            ),
        );

        if (!userThatIsNotPermitted) {
          // If system has only one role, it will not be possible to test this scenario
          expect(true).toBeTruthy();
          return;
        }

        await request(app.getHttpServer())
          .get(`${endPointUrl}/${userThatIsNotPermitted.id}`)
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

      const impersonatedRole: RoleEnum = RoleEnum.USER;

      it('Should get data', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
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

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        const response = await request(app.getHttpServer())
          .get(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .expect(200);

        expect(response.body).toBeDefined();

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('email');
        expect(response.body).toHaveProperty('role');
        expect(response.body).toHaveProperty('assignments');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body).toHaveProperty('updatedAt');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('version');

        expect(impersonatedRole).toEqual(response.body.role.name);
      });

      it('Should throw error if user id doesnt exist', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
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
          .get(`${endPointUrl}/INVALID`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .expect(404);
      });

      it('Should throw error if user is inactive', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)];

        await changeUserStatus(prisma, targetUser.email, StatusEnum.INACTIVE);

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
          .get(`${endPointUrl}/${targetUser.id}`)
          .query({
            module: currentModule,
          })
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .expect(403);
      });
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(`${endPointUrl}`, MethodEnum.GET, app);
    });
  });

  describe('Create user', () => {
    const endPointUrl = '/user';

    beforeEach(async () => {
      await removeUserTest(prisma, EMAIL_TEST_TWO);
    });

    describe('[Module]', () => {
      const randomModule = Object.keys(permissionsStructure.modules)[
        Math.floor(
          Math.random() * Object.keys(permissionsStructure.modules).length,
        )
      ];

      const assignmentModule = getMainAssignmentFromModule(
        randomModule as ModuleEnum,
      );

      const impersonatedRole: RoleEnum = RoleEnum.USER;

      it('Should throw error if module doesnt exist', async () => {
        const newUserRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const roleId = await getRoleId(prisma, newUserRole);

        const permittedAssignments = getRoleAllowedAssignments(newUserRole);

        const firstAssignmentPermitted = permittedAssignments[0];

        const assignmentsIds = (
          await getAssignmentsByName(prisma, firstAssignmentPermitted)
        )?.map(assignment => assignment.id);

        const createInput = generateCreateInput(
          roleId,
          assignmentsIds,
          EMAIL_TEST_TWO,
        );
        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: 'INVALID_MODULE',
          })
          .send(createInput)
          .expect(400);
      });

      it('Should throw error if module is not present in request', async () => {
        const newUserRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const roleId = await getRoleId(prisma, newUserRole);

        const permittedAssignments = getRoleAllowedAssignments(newUserRole);

        const firstAssignmentPermitted = permittedAssignments[0];

        if (!firstAssignmentPermitted) {
          console.log(
            '[Module] Skipping - System has not assignments for role',
          );
          expect(true).toBeTruthy();
          return;
        }

        const assignmentsIds = (
          await getAssignmentsByName(prisma, firstAssignmentPermitted)
        )?.map(assignment => assignment.id);

        const createInput = generateCreateInput(
          roleId,
          assignmentsIds,
          EMAIL_TEST_TWO,
        );

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .send(createInput)
          .expect(400);
      });

      it('Should throw forbidden error if logged user doesnt have create permission', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: false,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const createInput = generateCreateInput(
          roleId,
          assignmentsIds,
          EMAIL_TEST_TWO,
        );

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: randomModule })
          .send(createInput)
          .expect(403);
      });
    });

    describe('[Module] [Admin]', () => {
      const currentModule = ModuleEnum.ADMIN;
      const impersonatedRole: RoleEnum = RoleEnum.ADMIN;

      it('Should throw forbidden error if creating user has permitted assignments for role', async () => {
        const newUserRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          RoleEnum.USER,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const roleId = await getRoleId(prisma, newUserRole);

        const permittedAssignments = getRoleAllowedAssignments(newUserRole);

        const allAssignments = await getAssignmentsNames(prisma);

        const assignmentsDontPermittedForRole = allAssignments.find(
          assignment =>
            !permittedAssignments.includes(assignment as AssignmentsEnum),
        );

        if (
          !assignmentsDontPermittedForRole ||
          assignmentsDontPermittedForRole?.length === 0
        ) {
          // If system has only one role, it will not be possible to test this scenario
          console.log(
            '[Module] [Admin] Skipping - System has not assignments for role',
          );
          expect(true).toBeTruthy();
          return;
        }

        const assignmentsIds = (
          await getAssignmentsByName(
            prisma,
            assignmentsDontPermittedForRole as AssignmentsEnum,
          )
        )?.map(assignment => assignment.id);

        const createInput = generateCreateInput(
          roleId,
          assignmentsIds,
          EMAIL_TEST_TWO,
        );

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(createInput)
          .expect(403);
      });

      it('Should create an user', async () => {
        const newUserRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const roleId = await getRoleId(prisma, newUserRole);

        const permittedAssignments = getRoleAllowedAssignments(newUserRole);

        const firstAssignmentPermitted = permittedAssignments[0];

        const assignmentsIds = (
          await getAssignmentsByName(prisma, firstAssignmentPermitted)
        )?.map(assignment => assignment.id);

        const createInput = generateCreateInput(
          roleId,
          assignmentsIds,
          EMAIL_TEST_TWO,
        );
        const response = await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(createInput)
          .expect(201);

        expect(response.body).toBeDefined();
      });

      it('[Assignments] Should throw error if is creating an normal user and doesnt have assignments', async () => {
        const roleId = await getRoleId(prisma, RoleEnum.USER);

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const createInput = generateCreateInput(roleId, []);

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(createInput)
          .expect(400);
      });

      it('[Assignments] Should dont require assignments for admin create', async () => {
        const roleId = await getRoleId(prisma, RoleEnum.ADMIN);

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const createInput = generateCreateInput(roleId, []);
        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(createInput)
          .expect(201);
      });

      it('[Email] Should throw error if any required input is not present', async () => {
        const roleId = await getRoleId(prisma, RoleEnum.USER);

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const assignmentsIds = await getAssignmentsIds(prisma);

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(generatePartialEntity(roleId, assignmentsIds, ['email']))
          .expect(400);
      });

      it('[Email] Should throw error if its not valid format', async () => {
        const newUserRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const roleId = await getRoleId(prisma, newUserRole);

        const permittedAssignments = getRoleAllowedAssignments(newUserRole);

        const firstAssignmentPermitted = permittedAssignments[0];

        const assignmentsIds = (
          await getAssignmentsByName(prisma, firstAssignmentPermitted)
        )?.map(assignment => assignment.id);

        const createInputWithInvalidEmail = generateCreateInput(
          roleId,
          assignmentsIds,
        );

        createInputWithInvalidEmail.email = 'INVALID_EMAIL';

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(createInputWithInvalidEmail)
          .expect(400);
      });

      it('[Email] Should throw error if its exceded the maximum length', async () => {
        const newUserRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const roleId = await getRoleId(prisma, newUserRole);

        const permittedAssignments = getRoleAllowedAssignments(newUserRole);

        const firstAssignmentPermitted = permittedAssignments[0];

        const assignmentsIds = (
          await getAssignmentsByName(prisma, firstAssignmentPermitted)
        )?.map(assignment => assignment.id);

        const createInputWithInvalidEmail = generateCreateInput(
          roleId,
          assignmentsIds,
        );
        createInputWithInvalidEmail.email = generateRandomStrings(300);

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(createInputWithInvalidEmail)
          .expect(400);
      });

      it('[Name] Should throw error if any required input is not present', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const roleId = await getRoleId(prisma, RoleEnum.USER);
        const assignmentsIds = await getAssignmentsIds(prisma);

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(generatePartialEntity(roleId, assignmentsIds, ['name']))
          .expect(400);
      });

      it('[Name] Should throw error if its not valid format', async () => {
        const newUserRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const roleId = await getRoleId(prisma, newUserRole);

        const permittedAssignments = getRoleAllowedAssignments(newUserRole);

        const firstAssignmentPermitted = permittedAssignments[0];

        const assignmentsIds = (
          await getAssignmentsByName(prisma, firstAssignmentPermitted)
        )?.map(assignment => assignment.id);

        const createInputWithInvalidName = generateCreateInput(
          roleId,
          assignmentsIds,
        );
        createInputWithInvalidName.name = 123 as any;

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(createInputWithInvalidName)
          .expect(400);
      });

      it('[Name] Should throw error if its exceded the maximum length', async () => {
        const newUserRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const roleId = await getRoleId(prisma, newUserRole);

        const permittedAssignments = getRoleAllowedAssignments(newUserRole);

        const firstAssignmentPermitted = permittedAssignments[0];

        const assignmentsIds = (
          await getAssignmentsByName(prisma, firstAssignmentPermitted)
        )?.map(assignment => assignment.id);

        const createInputWithInvalidName = generateCreateInput(
          roleId,
          assignmentsIds,
        );
        createInputWithInvalidName.name = generateRandomStrings(300);

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(createInputWithInvalidName)
          .expect(400);
      });

      it('[RoleId] Should throw error if any required input is not present', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        const roleId = await getRoleId(prisma, RoleEnum.USER);
        const assignmentsIds = await getAssignmentsIds(prisma);

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(generatePartialEntity(roleId, assignmentsIds, ['roleId']))
          .expect(400);
      });

      it('[RoleId] Should throw error if is not string', async () => {
        const newUserRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });
        const roleId = await getRoleId(prisma, newUserRole);

        const permittedAssignments = getRoleAllowedAssignments(newUserRole);

        const firstAssignmentPermitted = permittedAssignments[0];

        const assignmentsIds = (
          await getAssignmentsByName(prisma, firstAssignmentPermitted)
        )?.map(assignment => assignment.id);

        const createInput = generateCreateInput(
          roleId,
          assignmentsIds,
          EMAIL_TEST_TWO,
        );
        createInput.roleId = 123 as any;

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(createInput)
          .expect(400);
      });

      it('[RoleId] Should throw error if its an empty string', async () => {
        const newUserRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });
        const roleId = await getRoleId(prisma, newUserRole);

        const permittedAssignments = getRoleAllowedAssignments(newUserRole);

        const firstAssignmentPermitted = permittedAssignments[0];

        const assignmentsIds = (
          await getAssignmentsByName(prisma, firstAssignmentPermitted)
        )?.map(assignment => assignment.id);

        const createInput = generateCreateInput(
          roleId,
          assignmentsIds,
          EMAIL_TEST_TWO,
        );
        createInput.roleId = '';

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(createInput)
          .expect(400);
      });

      it('[RoleId] Should throw error if role is not valid', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(['INVALID_ROLE'])
          .expect(400);
      });

      it('Should throw error if email already exists', async () => {
        const newUserRole = RoleEnum.USER;

        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: ModuleEnum.ADMIN,
              read: true,
              create: true,
              update: true,
              delete: true,
            },
          ],
        });
        const roleId = await getRoleId(prisma, newUserRole);

        const permittedAssignments = getRoleAllowedAssignments(newUserRole);

        const firstAssignmentPermitted = permittedAssignments[0];

        const assignmentsIds = (
          await getAssignmentsByName(prisma, firstAssignmentPermitted)
        )?.map(assignment => assignment.id);

        const createInputWithExistentEmail = generateCreateInput(
          roleId,
          assignmentsIds,
        );

        createInputWithExistentEmail.email = EMAIL_TEST;

        await request(app.getHttpServer())
          .post(`${endPointUrl}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: currentModule,
          })
          .send(createInputWithExistentEmail)
          .expect(409);
      });
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(`${endPointUrl}`, MethodEnum.POST, app);
    });
  });

  describe('Update user', () => {
    const endPointUrl = '/user';

    beforeEach(async () => {
      await Promise.all(
        Object.values(users).map(async user => {
          await revertUserToInitialState(prisma, {
            email: user.email,
            revertEmail: user.email,
          });
        }),
      );
    });

    describe('[Module]', () => {
      const randomModule = Object.keys(permissionsStructure.modules)[
        Math.floor(
          Math.random() * Object.keys(permissionsStructure.modules).length,
        )
      ];

      const assignmentModule = getMainAssignmentFromModule(
        randomModule as ModuleEnum,
      );

      const impersonatedRole: RoleEnum = RoleEnum.USER;

      it('Should throw error if module doesnt exist', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
          1,
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

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInput = generateUpdateInput(roleId, assignmentsIds);

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: 'INVALID_MODULE',
          })
          .send(updateInput)
          .expect(400);
      });

      it('Should throw error if module is not present in request', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
          1,
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
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInput = generateUpdateInput(roleId, assignmentsIds);
        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;

        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .send(updateInput)
          .expect(400);
      });

      it('Should throw forbidden error if logged user doesnt have update permission', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: false,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInput = generateUpdateInput(roleId, assignmentsIds);

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: randomModule })
          .send(updateInput)
          .expect(403);
      });

      it('Should throw forbidden error if logged user doesnt have module specified assignment', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              name: 'WRONG_ASSIGNMENT',
              read: true,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;

        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInput = generateUpdateInput(roleId, assignmentsIds);

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: randomModule,
          })
          .send(updateInput)
          .expect(403);
      });

      it('Should throw forbidden error if try to update user with different role on specified module', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
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

        const getPermittedRolesFromSelectedModule: RoleEnum[] =
          getRolesWithAccessToModule(randomModule as ModuleEnum);

        const userThatIsNotPermitted = Object.values(users).find(
          user =>
            !getPermittedRolesFromSelectedModule.includes(
              user.Role.name as RoleEnum,
            ),
        );

        if (!userThatIsNotPermitted) {
          // If system has only one role, it will not be possible to test this scenario
          expect(true).toBeTruthy();
          return;
        }

        const roleId = userThatIsNotPermitted.roleId;

        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(role, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInput = generateUpdateInput(roleId, assignmentsIds);

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: randomModule,
          })
          .send(updateInput)
          .expect(403);
      });

      it('Should throw forbidden error if try to update user and set not permitted assignments', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
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

        const getPermittedRolesFromSelectedModule: RoleEnum[] =
          getRolesWithAccessToModule(randomModule as ModuleEnum);

        const userThatIsNotPermitted = Object.values(users).find(
          user =>
            !getPermittedRolesFromSelectedModule.includes(
              user.Role.name as RoleEnum,
            ),
        );

        if (!userThatIsNotPermitted) {
          // If system has only one role, it will not be possible to test this scenario
          expect(true).toBeTruthy();
          return;
        }

        const roleId = users[getUserIdentifierByRoleAndIndex(role, 2)].roleId;

        const assignmentsIds = userThatIsNotPermitted.UserAssignment.map(
          assignment => assignment.assignmentsId,
        );

        const updateInput = generateUpdateInput(roleId, assignmentsIds);

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({
            module: randomModule,
          })
          .send(updateInput)
          .expect(403);
      });
    });

    describe('[Module] [Admin]', () => {
      const currentModule = ModuleEnum.ADMIN;

      const assignmentModule = getMainAssignmentFromModule(
        currentModule as ModuleEnum,
      );

      const impersonatedRole: RoleEnum = RoleEnum.USER;

      it('Should update an user', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInput = generateUpdateInput(roleId, assignmentsIds);

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(updateInput)
          .expect(200);
      });

      it('Should update a user with partial data', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const user = await prisma.user.findUnique({
          where: { id: users[getUserIdentifierByRoleAndIndex(role, 2)].id },
        });

        const updateInput = { version: user.version, name: 'New Name' };

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(updateInput)
          .expect(200);
      });

      it('Should throw not found error if id doesnt exist', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
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

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        await request(app.getHttpServer())
          .put(`${endPointUrl}/INVALID_ID`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(generateUpdateInput(roleId, assignmentsIds))
          .expect(404);
      });

      it('[Email] Should throw error if its not valid format', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInputWithInvalidEmail = generateUpdateInput(
          roleId,
          assignmentsIds,
        );

        updateInputWithInvalidEmail.email = 'INVALID_EMAIL';

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(updateInputWithInvalidEmail)
          .expect(400);
      });

      it('[Email] Should throw error if its exceded the maximum length', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInputWithInvalidEmail = generateUpdateInput(
          roleId,
          assignmentsIds,
        );

        updateInputWithInvalidEmail.email = generateRandomStrings(300);

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(updateInputWithInvalidEmail)
          .expect(400);
      });

      it('[Name] Should throw error if its not valid format', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInputWithInvalidName = generateUpdateInput(
          roleId,
          assignmentsIds,
        );

        updateInputWithInvalidName.name = 123 as any;

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(updateInputWithInvalidName)
          .expect(400);
      });

      it('[Name] Should throw error if its exceded the maximum length', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInputWithInvalidName = generateUpdateInput(
          roleId,
          assignmentsIds,
        );

        updateInputWithInvalidName.name = generateRandomStrings(300);

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(updateInputWithInvalidName)
          .expect(400);
      });

      it('[RoleId] Should throw error if is not string', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInput = generateUpdateInput(roleId, assignmentsIds);

        updateInput.roleId = 123 as any;

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(updateInput)
          .expect(400);
      });

      it('[RoleId] Should throw error if role is not valid', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const createInput = generateCreateInput(
          roleId,
          assignmentsIds,
          EMAIL_TEST_TWO,
        );
        createInput.roleId = '123-456';

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(createInput)
          .expect(400);
      });

      it('[MediaUrl] Should throw error if its not valid format', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInputWithInvalidMediaUrl = generateUpdateInput(
          roleId,
          assignmentsIds,
        );

        updateInputWithInvalidMediaUrl.mediaUrl = 123 as any;

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(updateInputWithInvalidMediaUrl)
          .expect(400);
      });

      it('[Conflict] Should throw error if email already exists', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const updateInputWithExistentEmail = generateUpdateInput(
          roleId,
          assignmentsIds,
        );

        updateInputWithExistentEmail.email = EMAIL_TEST;

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;

        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(updateInputWithExistentEmail)
          .expect(409);
      });

      it('Should fail to update itself', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const outdatedVersionNumber = 0;

        const updateInput = generateUpdateInput(roleId, assignmentsIds);

        updateInput.version = outdatedVersionNumber;

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(updateInput)
          .expect(409);
      });

      it('[Concurrency] Should fail to update user if version is outdated', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: true,
              delete: false,
            },
          ],
        });

        const roleId =
          users[getUserIdentifierByRoleAndIndex(impersonatedRole, 2)].roleId;
        const assignmentsIds = users[
          getUserIdentifierByRoleAndIndex(impersonatedRole, 2)
        ].UserAssignment.map(assignment => assignment.assignmentsId);

        const outdatedVersionNumber = 0;

        const updateInput = generateUpdateInput(roleId, assignmentsIds);

        updateInput.version = outdatedVersionNumber;

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .put(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ module: currentModule })
          .send(updateInput)
          .expect(409);
      });
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(`${endPointUrl}/id`, MethodEnum.PUT, app);
    });
  });

  describe('Delete user', () => {
    const endPointUrl = '/user';

    beforeEach(async () => {
      await Promise.all(
        Object.values(users).map(async user => {
          await revertUserToInitialState(prisma, {
            email: user.email,
            revertEmail: user.email,
          });
        }),
      );
    });

    describe('[Module]', () => {
      const randomModule = Object.keys(permissionsStructure.modules)[
        Math.floor(
          Math.random() * Object.keys(permissionsStructure.modules).length,
        )
      ];

      const assignmentModule = getMainAssignmentFromModule(
        randomModule as ModuleEnum,
      );

      const impersonatedRole: RoleEnum = RoleEnum.USER;

      it('Should throw error if module doesnt exist', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
          1,
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

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .delete(`${endPointUrl}/${targetUser}`)
          .query({ version: 1, module: 'INVALID_MODULE' })
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .expect(400);
      });

      it('Should throw error if module is not present in request', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
          1,
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

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .delete(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ version: 1 })
          .expect(400);
      });

      it('Should throw forbidden error if logged user doesnt have delete permission', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              assignment: assignmentModule,
              read: false,
              create: false,
              update: false,
              delete: false,
            },
          ],
        });

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .delete(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ version: 1, module: randomModule })
          .expect(403);
      });

      it('Should throw forbidden error if logged user doesnt have specified assignment', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
        );

        const impersonatedBearerToken = impersonateUser(jwtService, {
          id,
          email,
          role,
          assignments: [
            {
              name: 'WRONG_ASSIGNMENT',
              read: true,
              create: false,
              update: false,
              delete: false,
            },
          ],
        });

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .delete(`${endPointUrl}/${targetUser}`)
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .query({ version: 1, module: randomModule })
          .expect(403);
      });

      it('Should throw forbidden error if user is trying to delete a user with different role on specified module', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
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

        const getPermittedRolesFromSelectedModule: RoleEnum[] =
          getRolesWithAccessToModule(randomModule as ModuleEnum);

        const userThatIsNotPermitted = Object.values(users).find(
          user =>
            !getPermittedRolesFromSelectedModule.includes(
              user.Role.name as RoleEnum,
            ),
        );

        if (!userThatIsNotPermitted) {
          // If system has only one role, it will not be possible to test this scenario
          expect(true).toBeTruthy();
          return;
        }

        await request(app.getHttpServer())
          .delete(`${endPointUrl}/${userThatIsNotPermitted.id}`)
          .query({ version: 1, module: randomModule })
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .expect(403);
      });
    });

    describe('[Module] [Admin]', () => {
      const currentModule = ModuleEnum.ADMIN;

      const assignmentModule = getMainAssignmentFromModule(
        currentModule as ModuleEnum,
      );

      const permittedRoles = getRolesWithAccessToModule(
        currentModule as ModuleEnum,
      );

      const impersonatedRole: RoleEnum = RoleEnum.USER;

      it('Should inactive an user', async () => {
        const { email, id, role } = getImpersonateInformations(
          impersonatedRole,
          users,
          1,
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
              delete: true,
            },
          ],
        });

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .delete(`${endPointUrl}/${targetUser}`)
          .query({ version: 1, module: currentModule })
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .expect(200);
      });

      it('Should throw error if id is present and version not', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
          1,
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

        const targetUser = users[getUserIdentifierByRoleAndIndex(role, 2)].id;
        await request(app.getHttpServer())
          .delete(`${endPointUrl}/${targetUser}`)
          .query({ module: currentModule })
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .expect(400);
      });

      it('Should throw an error because user not exists', async () => {
        const { email, id, role } = getImpersonateInformations(
          RoleEnum.ADMIN,
          users,
          1,
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
          .delete(`${endPointUrl}/INVALID_ID`)
          .query({ version: 1, module: currentModule })
          .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
          .expect(404);
      });
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(
        `${endPointUrl}/id`,
        MethodEnum.DELETE,
        app,
      );
    });
  });

  describe('Update user personal data', () => {
    const endPointUrl = '/user/personal/data';

    beforeEach(async () => {
      await Promise.all(
        Object.values(users).map(async user => {
          await revertUserToInitialState(prisma, {
            email: user.email,
            revertEmail: user.email,
          });
        }),
      );
    });

    it('Should update personal data', async () => {
      const { email, id, role } = getImpersonateInformations(
        RoleEnum.USER,
        users,
        1,
      );

      const impersonatedBearerToken = impersonateUser(jwtService, {
        id,
        email,
        role,
      });

      const updateBodyData: UpdateUserPersonalData = {
        name: 'New Name',
        mediaUrl: 'https://www.google.com',
        version: 1,
      };

      await request(app.getHttpServer())
        .patch(`${endPointUrl}`)
        .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
        .send(updateBodyData)
        .expect(200);
    });

    it('Should update personal data if only have name', async () => {
      const { email, id, role } = getImpersonateInformations(
        RoleEnum.USER,
        users,
        1,
      );

      const impersonatedBearerToken = impersonateUser(jwtService, {
        id,
        email,
        role,
      });

      const updateBodyData: UpdateUserPersonalData = {
        name: 'New Name',
        version: 1,
      };

      await request(app.getHttpServer())
        .patch(`${endPointUrl}`)
        .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
        .send(updateBodyData)
        .expect(200);
    });

    it('Should update personal data if only have media', async () => {
      const { email, id, role } = getImpersonateInformations(
        RoleEnum.USER,
        users,
        1,
      );

      const impersonatedBearerToken = impersonateUser(jwtService, {
        id,
        email,
        role,
      });

      const updateBodyData: UpdateUserPersonalData = {
        mediaUrl: 'https://www.google.com',
        version: 1,
      };

      await request(app.getHttpServer())
        .patch(`${endPointUrl}`)
        .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
        .send(updateBodyData)
        .expect(200);
    });

    it('Should update personal data if dont have nothing', async () => {
      const { email, id, role } = getImpersonateInformations(
        RoleEnum.USER,
        users,
        1,
      );

      const impersonatedBearerToken = impersonateUser(jwtService, {
        id,
        email,
        role,
      });

      const updateBodyData: UpdateUserPersonalData = {
        version: 1,
      };

      await request(app.getHttpServer())
        .patch(`${endPointUrl}`)
        .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
        .send(updateBodyData)
        .expect(200);
    });

    it('[Concurrency] Should fail to update personal data if version is outdated', async () => {
      const { email, id, role } = getImpersonateInformations(
        RoleEnum.USER,
        users,
        1,
      );

      const impersonatedBearerToken = impersonateUser(jwtService, {
        id,
        email,
        role,
      });

      const outdatedVersionNumber = 0;

      const updateBodyData: UpdateUserPersonalData = {
        version: outdatedVersionNumber,
        name: 'New Name',
      };

      await request(app.getHttpServer())
        .patch(`${endPointUrl}`)
        .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
        .send(updateBodyData)
        .expect(409);
    });

    it('Base authentication tests', async () => {
      await baseAuthenticationTests(`${endPointUrl}`, MethodEnum.PATCH, app);
    });
  });

  describe('Block user', () => {
    const endPointUrl = '/user/block';

    beforeEach(async () => {
      await Promise.all(
        Object.values(users).map(async user => {
          await revertUserToInitialState(prisma, {
            email: user.email,
            revertEmail: user.email,
          });
        }),
      );
    });

    it('Should block user', async () => {
      const { email, id, role } = getImpersonateInformations(
        RoleEnum.ADMIN,
        users,
        1,
      );

      const impersonatedBearerToken = impersonateUser(jwtService, {
        id,
        email,
        role,
      });

      const blockUserDto: UserRestrictionBody = {
        id,
        version: 1,
      };

      await request(app.getHttpServer())
        .patch(`${endPointUrl}`)
        .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
        .send(blockUserDto)
        .expect(200);
    });

    it('Should throw error if version is outdated', async () => {
      const { email, id, role } = getImpersonateInformations(
        RoleEnum.ADMIN,
        users,
        1,
      );

      const impersonatedBearerToken = impersonateUser(jwtService, {
        id,
        email,
        role,
      });

      const outdatedVersionNumber = 0;

      const blockUserDto: UserRestrictionBody = {
        id,
        version: outdatedVersionNumber,
      };

      await request(app.getHttpServer())
        .patch(`${endPointUrl}`)
        .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
        .send(blockUserDto)
        .expect(409);
    });
  });

  describe('Unblock user', () => {
    const endPointUrl = '/user/unblock';

    beforeEach(async () => {
      await Promise.all(
        Object.values(users).map(async user => {
          await revertUserToInitialState(prisma, {
            email: user.email,
            revertEmail: user.email,
          });
        }),
      );
    });

    it('Should unblock user', async () => {
      const { email, id, role } = getImpersonateInformations(
        RoleEnum.ADMIN,
        users,
        1,
      );

      const impersonatedBearerToken = impersonateUser(jwtService, {
        id,
        email,
        role,
      });

      const unblockUserDto: UserRestrictionBody = {
        id,
        version: 1,
      };

      await request(app.getHttpServer())
        .patch(`${endPointUrl}`)
        .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
        .send(unblockUserDto)
        .expect(200);
    });

    it('Should throw error if version is outdated', async () => {
      const { email, id, role } = getImpersonateInformations(
        RoleEnum.ADMIN,
        users,
        1,
      );

      const impersonatedBearerToken = impersonateUser(jwtService, {
        id,
        email,
        role,
      });

      const outdatedVersionNumber = 0;

      const unblockUserDto: UserRestrictionBody = {
        id,
        version: outdatedVersionNumber,
      };

      await request(app.getHttpServer())
        .patch(`${endPointUrl}`)
        .set({ Authorization: `Bearer ${impersonatedBearerToken}` })
        .send(unblockUserDto)
        .expect(409);
    });
  });
});
