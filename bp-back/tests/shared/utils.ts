import { faker } from '@faker-js/faker';
import {
  Assignment,
  AssignmentsEnum,
  PrismaClient,
  RoleEnum,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/modules/user/entity/user.entity';

/**
 * Cryptographically hashes a text using bcrypt with a salt factor of 10.
 *
 * @param {string} text - The text to be hashed.
 * @returns {Promise<string>} A promise that resolves to the hashed text.
 */
export const cryptText = async (text: string): Promise<string> => {
  return await bcrypt.hash(text, 10);
};

/**
 * Retrieves the ID of admin role from the PrismaClient instance.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @returns {Promise<string>} A promise that resolves to an id of admin.
 */
export const getRoleId = async (
  prisma: PrismaClient,
  name: RoleEnum,
): Promise<string> => {
  const role = await prisma.role.findFirst({
    where: {
      name,
    },
  });

  return role.id;
};

/**
 * Retrieves assignments by their name from the database.
 *
 * @async
 * @function getAssignmentsByName
 * @param {PrismaClient} prisma - The PrismaClient instance used to interact with the database.
 * @param {AssignmentsEnum} name - The name of the assignments to retrieve.
 * @returns {Promise<Array<Assignment>>} - A promise resolving to an array of assignments with the specified name.
 */
export const getAssignmentsByName = async (
  prisma: PrismaClient,
  name: AssignmentsEnum,
): Promise<Array<Assignment>> => {
  return await prisma.assignment.findMany({
    where: {
      name: name,
    },
  });
};

/**
 * Retrieves the IDs of all assignments from the PrismaClient instance.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @returns {Promise<string[]>} A promise that resolves to an array of assignments IDs.
 */
export const getAssignmentsIds = async (
  prisma: PrismaClient,
): Promise<string[]> => {
  const assignments = await prisma.assignment.findMany();
  return assignments.map(assignment => assignment.id);
};

/**
 * Retrieves the names of all assignments from the PrismaClient instance.
 *
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @returns {Promise<string[]>} A promise that resolves to an array of assignments names.
 */
export const getAssignmentsNames = async (
  prisma: PrismaClient,
): Promise<string[]> => {
  const assignments = await prisma.assignment.findMany();
  return assignments.map(assignment => assignment.name);
};

/**
 * Generates random alphanumeric strings of the specified length.
 *
 * @param {number} length - The length of the random string to generate.
 * @returns {string} The generated random string.
 */
export const generateRandomStrings = (length: number): string => {
  const randomStrings = [];
  for (let i = 0; i < length; i++) {
    randomStrings.push(faker.string.alphanumeric());
  }

  return randomStrings.join();
};

/**
 * Get in the database the user with the email test.
 * @param {PrismaClient} prisma - The PrismaClient instance.
 * @param {string} emailUser - The email of the user.
 * @returns {Promise<UserEntity>} A promise that resolves to user entity.
 */
export const getUser = async (
  prisma: PrismaClient,
  emailUser: string,
): Promise<UserEntity> => {
  return await prisma.user.findFirst({
    where: {
      email: emailUser,
      deletedAt: null,
    },
  });
};

/**
 * Retrieves impersonation information for a specified role and user.
 *
 * @function getImpersonateInformations
 * @param {RoleEnum} role - The role for which to retrieve impersonation information.
 * @param {Object.<string, UserEntity>} user - An object containing user entities for different roles.
 * @returns {{ role: RoleEnum, id: string, email: string }} - The impersonation information, including the role, user ID, and email.
 */
export const getImpersonateInformations = (
  role: RoleEnum,
  user: { [key: string]: UserEntity },
  index?: number,
): {
  role: RoleEnum;
  id: string;
  email: string;
} => {
  const roleIndex = index ? getUserIdentifierByRoleAndIndex(role, index) : role;

  return {
    role,
    id: user[roleIndex].id,
    email: user[roleIndex].email,
  };
};

/**
 * Retrieves a user identifier based on the role and index.
 *
 * @function getUserIdentifierByRoleAndIndex
 * @param {RoleEnum} role - The role of the user.
 * @param {number} index - The index of the user.
 * @returns {string} - The user identifier constructed using the role and index.
 */
export const getUserIdentifierByRoleAndIndex = (
  role: RoleEnum,
  index: number,
): string => {
  return `${role}_${index}`;
};
