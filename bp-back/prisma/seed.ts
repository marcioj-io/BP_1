import {
  Assignment,
  AssignmentsEnum,
  Client,
  CostCenter,
  Module,
  ModuleAssignment,
  ModuleEnum,
  Prisma,
  PrismaClient,
  Role,
  RoleEnum,
  RoleModule,
  StatusEnum,
  User,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  getAccessibleModulesByRole,
  getModuleAllowedAssignments,
} from 'src/modules/tenant/tenant.helper';

import { seedTests } from './seed-test';

export const ADMIN_EMAIL = 'admin@gmail.com';
export const CLIENT_EMAIL_1 = 'client1@gmail.com';
export const CLIENT_EMAIL_2 = 'client2@gmail.com';
export const ADMIN_PASSWORD = 'admin';
export const CLIENT_PASSWORD = 'admin';

const prisma = new PrismaClient();

export interface IBaseDataSeed {
  roles: Role[];
  assignments: Assignment[];
  modules: Module[];
  roleModules: RoleModule[];
  moduleAssignments: ModuleAssignment[];
}

/**
 * Initiates the base seeding process for the database. This includes seeding roles, assignments,
 * modules, and their relationships. It serves as the entry point to populate the database with
 * initial data necessary for the application to function correctly.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance to interact with the database.
 * @returns {Promise<IBaseDataSeed>} - The base data seeded into the database including roles, assignments, and modules.
 */
const baseSeed = async (prisma: PrismaClient): Promise<IBaseDataSeed> => {
  console.log('Seeding base...');

  const baseData: IBaseDataSeed = {
    roles: [],
    assignments: [],
    modules: [],
    roleModules: [],
    moduleAssignments: [],
  };

  const roles = await seedRoles(prisma);
  const assignments = await seedAssignments(prisma);
  const modules = await seedModules(prisma);

  await seedRoleModuleRelations(prisma, roles, modules);
  await seedModuleAssignmentRelations(prisma, modules, assignments);

  Object.assign(baseData, { roles }, { assignments });

  return baseData;
};
/**
 * Seeds assignments based on the AssignmentsEnum. Each assignment is created or updated to be active,
 * ensuring that the initial necessary permissions are available in the system.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance to interact with the database.
 * @returns {Promise<Assignment[]>} - A promise that resolves to the array of Assignment objects created or updated.
 */
const seedAssignments = async (prisma: PrismaClient): Promise<Assignment[]> => {
  console.log('Seeding assignments...');

  return await prisma.$transaction(
    async (transaction: Prisma.TransactionClient) => {
      const operations = Object.entries(AssignmentsEnum).map(async ([name]) => {
        return await transaction.assignment.upsert({
          where: { name: name as AssignmentsEnum },
          create: { name: name as AssignmentsEnum, status: StatusEnum.ACTIVE },
          update: { name: name as AssignmentsEnum, status: StatusEnum.ACTIVE },
        });
      });

      return Promise.all(operations);
    },
    {
      maxWait: 30000,
      timeout: 30000,
    },
  );
};

/**
 * Seeds modules based on the ModuleEnum. It ensures that each module specified in the enum is present
 * in the database with an active status, ready for role assignments and further configuration.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance to interact with the database.
 * @returns {Promise<Module[]>} - A promise that resolves to the array of Module objects created or updated.
 */
const seedModules = async (prisma: PrismaClient): Promise<Module[]> => {
  console.log('Seeding module...');

  return await prisma.$transaction(
    async (transaction: Prisma.TransactionClient) => {
      const operations = Object.entries(ModuleEnum).map(async ([name]) => {
        return await transaction.module.upsert({
          where: { name: name as ModuleEnum },
          create: { name: name as ModuleEnum, status: StatusEnum.ACTIVE },
          update: { name: name as ModuleEnum, status: StatusEnum.ACTIVE },
        });
      });
      return Promise.all(operations);
    },

    {
      maxWait: 30000,
      timeout: 30000,
    },
  );
};

/**
 * Seeds roles into the database based on the RoleEnum. For each role defined in
 * RoleEnum, this function ensures that a corresponding role exists in the database
 * with an ACTIVE status. It utilizes an upsert operation to either create a new role
 * if it doesn't exist, or update its status to ACTIVE if it does.
 *
 * This process ensures that all necessary roles are available in the system for
 * assigning to users and controlling access to various parts of the application.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance for database interaction.
 * @returns {Promise<Role[]>} A promise that resolves to an array of the Role objects
 * created or updated in the database.
 */
const seedRoles = async (prisma: PrismaClient): Promise<Role[]> => {
  console.log('Seeding roles...');

  return await prisma.$transaction(
    async (transaction: Prisma.TransactionClient) => {
      const operations = Object.entries(RoleEnum).map(async ([name]) => {
        return await transaction.role.upsert({
          where: { name: name as RoleEnum },
          create: { name: name as RoleEnum, status: StatusEnum.ACTIVE },
          update: { name: name as RoleEnum, status: StatusEnum.ACTIVE },
        });
      });

      return Promise.all(operations);
    },
    {
      maxWait: 30000,
      timeout: 30000,
    },
  );
};

/**
 * Establishes relationships between modules and assignments. This involves linking each module to its
 * permitted assignments as defined by the system's permission structure.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance to interact with the database.
 * @param {Module[]} modules - The array of Module objects to relate assignments to.
 * @param {Assignment[]} assignments - The array of Assignment objects to be related to modules.
 * @returns {Promise<void>}
 */
const seedModuleAssignmentRelations = async (
  prisma: PrismaClient,
  modules: Module[],
  assignments: Assignment[],
): Promise<void> => {
  console.log('Seeding module assignment relations...');

  for (const module of modules) {
    const assignmentIds: string[] = [];

    const permittedAssignments = getModuleAllowedAssignments(module.name);

    for (const assignmentName of permittedAssignments) {
      const assignmentId = assignments.find(
        assignment => assignment.name === assignmentName,
      )?.id;

      if (!assignmentId) continue;

      assignmentIds.push(assignmentId);
    }

    for (const assignmentId of assignmentIds) {
      await seedModuleAssignments(prisma, assignmentId, module.id);
    }
  }
};

/**
 * Seeds the relationships between modules and assignments in the database.
 * This function first checks for an existing relationship between a specific
 * assignment and module to avoid creating duplicate entries. If no such relationship
 * exists, it proceeds to create a new one, effectively assigning the assignment to the module.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance for database interaction.
 * @param {string} assignmentId - The ID of the assignment to be linked.
 * @param {string} moduleId - The ID of the module to which the assignment will be linked.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
const seedModuleAssignments = async (
  prisma: PrismaClient,
  assignmentId: string,
  moduleId: string,
): Promise<void> => {
  const alreadyExistsRelation = await prisma.moduleAssignment.findFirst({
    where: {
      AND: [{ assignmentId: assignmentId }, { moduleId: moduleId }],
    },
  });

  if (alreadyExistsRelation) {
    console.log(
      `Module assignment ${assignmentId} - ${moduleId} relation already exists`,
    );

    return;
  }

  await prisma.moduleAssignment.create({
    data: {
      Assigments: { connect: { id: assignmentId } },
      Module: { connect: { id: moduleId } },
    },
  });
};

/**
 * Seeds the relationships between roles and modules, enabling access control based on the permitted
 * modules for each role. This setup is crucial for defining which parts of the application each role can interact with.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance to interact with the database.
 * @param {Role[]} roles - The array of Role objects to relate modules to.
 * @param {Module[]} modules - The array of Module objects to be related to roles.
 * @returns {Promise<void>}
 */
const seedRoleModuleRelations = async (
  prisma: PrismaClient,
  roles: Role[],
  modules: Module[],
): Promise<void> => {
  console.log('Seeding role module relations...');

  for (const role of roles) {
    const moduleIds: string[] = [];

    const permittedModules = getAccessibleModulesByRole(role.name);

    for (const moduleName of permittedModules) {
      const moduleId = modules.find(module => module.name === moduleName)?.id;

      if (!moduleId) continue;

      moduleIds.push(moduleId);
    }

    for (const moduleId of moduleIds) {
      await seedRoleModules(prisma, role.id, moduleId);
    }
  }
};

/**
 * Seeds the relationships between roles and modules in the database.
 * This function checks if a relationship between a given role and module
 * already exists to prevent duplication. If the relationship does not exist,
 * it creates a new one, effectively linking the role to the module.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance for database interaction.
 * @param {string} roleId - The ID of the role to be linked.
 * @param {string} moduleId - The ID of the module to be linked.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
const seedRoleModules = async (
  prisma: PrismaClient,
  roleId: string,
  moduleId: string,
): Promise<void> => {
  const alreadyExistsRelation = await prisma.roleModule.findFirst({
    where: {
      AND: [{ roleId: roleId }, { moduleId: moduleId }],
    },
  });

  if (alreadyExistsRelation) {
    console.log(`Role module ${roleId} - ${moduleId} relation already exists`);

    return;
  }

  await prisma.roleModule.create({
    data: {
      Role: { connect: { id: roleId } },
      Module: { connect: { id: moduleId } },
    },
  });
};

/**
 * Creates an admin user if one does not already exist. This ensures that there is at least one user
 * with administrative privileges to manage the application after seeding.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance to interact with the database.
 * @param {IBaseDataSeed} baseDataSeed - The base data seed containing roles and assignments for user creation.
 * @returns {Promise<void>}
 */
const seedAdminUser = async (
  prisma: PrismaClient,
  baseDataSeed: IBaseDataSeed,
) => {
  console.log('Seeding user');

  let alreadyHasAdminUser =
    (await prisma.user.count({
      where: {
        Role: {
          name: RoleEnum.ADMIN,
        },
      },
    })) > 0;

  if (alreadyHasAdminUser) {
    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const userAdmin = await transaction.user.findFirstOrThrow({
        where: {
          email: ADMIN_EMAIL,
        },
      });

      await transaction.user.delete({
        where: {
          id: userAdmin.id,
        },
      });
    });

    alreadyHasAdminUser = false;
  }

  if (!alreadyHasAdminUser) {
    console.log('Creating admin user');

    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const roleAdminId = baseDataSeed.roles.find(
        role => role.name === RoleEnum.ADMIN,
      ).id;

      await transaction.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: 'Admin User',
          password: await bcrypt.hash(ADMIN_PASSWORD, 10),
          status: StatusEnum.ACTIVE,
          refreshToken: null,
          ip: null,
          blocked: false,
          deletedAt: null,
          version: 1,
          loginAttempts: 0,
          ...(baseDataSeed.assignments && {
            UserAssignment: {
              create: baseDataSeed.assignments.map(assignment => ({
                create: true,
                read: true,
                update: true,
                delete: true,
                Assignment: {
                  connect: {
                    id: assignment.id,
                  },
                },
              })),
            },
          }),
          Role: {
            connect: {
              id: roleAdminId,
            },
          },
        },
      });
    });
  }
};

const seedClient = async (
  prisma: PrismaClient,
  baseDataSeed: IBaseDataSeed,
  clientEmail: string,
  cnpj: string,
) => {
  console.log('Seeding user');

  // let hasUserClient =
  //   (await prisma.user.count({
  //     where: {
  //       email: clientEmail,
  //     },
  //   })) > 0;

  const userClient = await prisma.user.findFirst({
    where: {
      email: clientEmail,
    },
  });

  let hasUserClient = userClient != null;

  if (hasUserClient != null) {
    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      await transaction.user.delete({
        where: {
          id: userClient.id,
        },
      });
    });

    hasUserClient = false;
  }

  if (!hasUserClient) {
    console.log('Creating client');

    const hasClient =
      (await prisma.client.count({
        where: {
          cnpj,
        },
      })) > 0;

    if (hasClient) {
      await prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          await transaction.client.delete({
            where: {
              cnpj,
            },
          });
        },
      );
    }

    let client: Client = null;
    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      client = await transaction.client.create({
        data: {
          cnpj: cnpj,
          name: 'Client',
          status: StatusEnum.ACTIVE,
          contactEmail: 'contact-email@mail.com',
          contactPhone: '11999999999',
          generalNote: 'General notes',
          legalName: 'Client Legal Name',
          deletedAt: null,
          version: 1,
          municipalRegistration: '11111111111111',
          primaryContactPerson: 'Primary Contact Person',
          primaryContactPersonTitle: 'Primary Contact Person Title',
          stateRegistration: '11111111111111',
          useTaxInvoice: true,
          costCenters: {
            create: [
              {
                description: 'Cost Center 1',
                name: 'Cost Center 1',
                status: StatusEnum.ACTIVE,
                version: 1,
              },
              {
                description: 'Cost Center 2',
                name: 'Cost Center 2',
                status: StatusEnum.ACTIVE,
                version: 1,
              },
            ],
          },
        },
      });
    });
    const clientId = client.id;

    console.log('Creating User client');
    let user: User = null;
    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const roleId = baseDataSeed.roles.find(
        role => role.name === RoleEnum.USER,
      ).id;

      user = await transaction.user.create({
        data: {
          email: clientEmail,
          name: 'Client User',
          password: await bcrypt.hash(ADMIN_PASSWORD, 10),
          status: StatusEnum.ACTIVE,
          refreshToken: null,
          ip: null,
          blocked: false,
          deletedAt: null,
          ownsClient: true,
          version: 1,
          loginAttempts: 0,
          ...(baseDataSeed.assignments && {
            UserAssignment: {
              create: baseDataSeed.assignments.map(assignment => ({
                create: true,
                read: true,
                update: true,
                delete: true,
                Assignment: {
                  connect: {
                    id: assignment.id,
                  },
                },
              })),
            },
          }),
          Role: {
            connect: {
              id: roleId,
            },
          },
        },
      });
    });

    console.log('Linking user to client');
    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      await transaction.user.update({
        where: {
          id: user.id,
        },
        data: {
          client: {
            connect: {
              id: clientId,
            },
          },
        },
      });
    });

    console.log('Linking user to costCenters');
    await prisma.$transaction(async (transaction: Prisma.TransactionClient) => {
      const costCenters = await transaction.costCenter.findMany({
        where: {
          clientId: clientId,
        },
      });

      await transaction.userCostCenter.deleteMany({
        where: {
          userId: user.id,
        },
      });

      await transaction.userCostCenter.createMany({
        data: costCenters.map(costCenter => ({
          userId: user.id,
          costCenterId: costCenter.id,
        })),
      });
    });
  }
};

(async () => {
  const baseData: IBaseDataSeed = await baseSeed(prisma);

  const isTestEnviroment = process.env.ENV == 'TEST';

  if (isTestEnviroment) {
    await seedTests(prisma, baseData);
  } else {
    await seedAdminUser(prisma, baseData);

    const cnpj_1 = '11111111111111';
    await seedClient(prisma, baseData, CLIENT_EMAIL_1, cnpj_1);

    const cnpj_2 = '22222222222222';
    await seedClient(prisma, baseData, CLIENT_EMAIL_2, cnpj_2);
  }
})();
