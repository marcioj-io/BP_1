import { PrismaClient, RoleEnum, StatusEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { IBaseDataSeed } from './seed';

const EMAIL_TEST = 'test_user@gmail.com';
const PASSWORD_TEST = 'p@sswordTest123';

export const seedTests = async (
  prisma: PrismaClient,
  baseDataSeed: IBaseDataSeed,
) => {
  console.log('Seeding tests...');

  const roleAdminId = baseDataSeed.roles.find(
    role => role.name === RoleEnum.ADMIN,
  ).id;

  const userExists = await prisma.user.findFirstOrThrow({
    where: {
      email: EMAIL_TEST,
    },
  });

  await prisma.user.upsert({
    where: {
      id: userExists.id,
    },
    create: {
      email: EMAIL_TEST,
      name: 'Test User',
      password: await bcrypt.hash(PASSWORD_TEST, 10),
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
    update: {
      email: EMAIL_TEST,
      name: 'Test User',
      password: await bcrypt.hash(PASSWORD_TEST, 10),
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
};
