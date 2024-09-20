import { JwtService } from '@nestjs/jwt';
import { PrismaClient, StatusEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PASSWORD_TEST } from 'src/utils/test/constants';

import { generateCreateInput } from './user.fixture.generator';

/**
 * Reverts a user to their initial state by updating their data in the database.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {Object} data - The data object containing the user's email and ID and an possible revert email.
 */
export const revertUserToInitialState = async (
  prisma: PrismaClient,
  data: {
    email?: string;
    id?: string;
    revertEmail: string;
  },
) => {
  if (!data.id && !data.email) {
    throw new Error('[revertUserToInitialState] No email or ID provided');
  }

  const user = await prisma.user.findFirst({
    where: {
      ...(data.id
        ? { id: data.id, deletedAt: null }
        : { email: data.email, deletedAt: null }),
    },
  });

  if (user) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: data.revertEmail,
        password: await bcrypt.hash(PASSWORD_TEST, 10),
        loginAttempts: 0,
        blocked: false,
        status: StatusEnum.ACTIVE,
        deletedAt: null,
        version: 1,
      },
    });
  }
};

/**
 * Asynchronously changes the status of a user identified by their email.
 *
 * This function first checks if the user with the specified email exists using the
 * 'validateUserExists' function. If the user exists, it updates the user's status
 * in the database using the Prisma client. The status is set to one of the values
 * defined in the 'StatusEnum'. The function does not return anything.
 *
 * @param {PrismaClient} prisma - An instance of PrismaClient to interact with the database.
 * @param {string} email - The email of the user whose status is to be changed.
 * @param {StatusEnum} status - The new status to set for the user, based on the StatusEnum.
 */
export const changeUserStatus = async (
  prisma: PrismaClient,
  email: string,
  status: StatusEnum,
) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
      deletedAt: null,
    },
  });

  if (user) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        status,
      },
    });
  }
};

export const generateTestUser = async (
  prisma: PrismaClient,
  email: string,
  roleId: string,
  assignmentIds: string[],
) => {
  const createInput = generateCreateInput(roleId, assignmentIds, email);

  const user = await prisma.user.create({
    data: {
      email: createInput.email,
      name: createInput.name,
      password: await bcrypt.hash(PASSWORD_TEST, 10),
      UserAssignment: {
        create: createInput.assignments.map(assignment => ({
          create: assignment.create,
          read: assignment.read,
          update: assignment.update,
          delete: assignment.delete,
          Assignment: {
            connect: {
              id: assignment.assignmentId,
            },
          },
        })),
      },
      blocked: false,
      Role: {
        connect: {
          id: createInput.roleId,
        },
      },
      status: StatusEnum.ACTIVE,
    },
    include: {
      Role: true,
      UserAssignment: true,
    },
  });

  return user;
};

/**
 * Removes a test user from the database, including related records.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {string} email - The email of the user to remove.
 */
export const removeUserTest = async (prisma: PrismaClient, email: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
      deletedAt: null,
    },
  });

  if (user) {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  }
};

/**
 * Blocks a user and sets their status to inactive with a deletion timestamp.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {string} email - The email of the user to block.
 */
export const blockUserAndInactive = async (
  prisma: PrismaClient,
  email: string,
) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
      deletedAt: null,
    },
  });

  if (user) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        status: StatusEnum.INACTIVE,
        blocked: true,
        deletedAt: new Date(),
      },
    });
  }
};

/**
 * Validates if a user with the specified email exists in the database.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {string} data - { email: The email to validate OR id: The ID to validate }
 * @returns {Promise<boolean>} A promise that resolves to true if the user exists, false otherwise.
 */
export const validateUserExists = async (
  prisma: PrismaClient,
  data: {
    email?: string;
    id?: string;
  },
): Promise<boolean> => {
  if (!data.id && !data.email) return;

  return (
    (await prisma.user.count({
      where: {
        ...(data.id != null
          ? { id: data.id }
          : {
              email: data.email,
            }),
      },
    })) > 0
  );
};

/**
 * Incorporates user information into a JWT access token.
 *
 * @function impersonateUser
 * @param {JwtService} jwtService - The JwtService instance used to sign the JWT token.
 * @param {object} payload - The payload containing user information to be incorporated into the token.
 * @returns {string} - The JWT access token incorporating the user information.
 */
export const impersonateUser = (jwtService: JwtService, payload: object) => {
  const accessToken = jwtService.sign(payload, {
    secret: process.env.AT_SECRET,
    expiresIn: process.env.JWT_ACCESS_LIFETIME,
  });

  return accessToken;
};
