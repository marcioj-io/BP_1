import { faker } from '@faker-js/faker';
import { StatusEnum } from '@prisma/client';
import { UserCreateDto } from 'src/modules/user/dto/request/user.create.dto';
import { UserUpdateDto } from 'src/modules/user/dto/request/user.update.dto';
import { EMAIL_TEST_TWO } from 'src/utils/test/constants';

/**
 * Generates a create input object for a user with the specified role IDs.
 *
 * @param {string[]} roleId - An array of role IDs to associate with the user.
 * @returns {UserCreateDto} The generated create input object.
 */
export const generateCreateInput = (
  roleId: string,
  assignmentsIds: string[],
  email = EMAIL_TEST_TWO,
): UserCreateDto => {
  const createInput: UserCreateDto = {
    email,
    name: faker.person.firstName(),
    roleId,
    ...(assignmentsIds.length && {
      assignments: assignmentsIds.map(assignmentId => {
        return {
          assignmentId,
          status: StatusEnum.ACTIVE,
          create: true,
          read: true,
          update: true,
          delete: true,
        };
      }),
    }),
  };

  return createInput;
};

/**
 * Generates an update input object for a user with the specified role IDs.
 *
 * @param {string} roleId - An ID to associate with the user.
 * @returns {UserUpdateDto} The generated update input object.
 */
export const generateUpdateInput = (
  roleId: string,
  assignmentsIds: string[],
): UserUpdateDto => {
  const updateInput: UserUpdateDto = {
    name: faker.person.firstName(),
    email: faker.internet.email(),
    mediaUrl: 'www.google.com.br/image.png',
    version: 1,
    roleId,
    assignments: assignmentsIds.map(assignmentId => {
      return {
        assignmentId,
        status: StatusEnum.ACTIVE,
        create: true,
        read: true,
        update: true,
        delete: true,
      };
    }),
    costCenters: [],
    sources: [],
    status: 'ACTIVE',
  };

  return updateInput;
};

/**
 * Generates a partial entity with specified role IDs and removes specified fields.
 *
 * @param {string} roleId - An ID to associate with the entity.
 * @param {string[]} removeFields - An array of field names to remove from the entity.
 * @returns {Partial<UserCreateDto>} The generated partial entity.
 */
export const generatePartialEntity = (
  roleId: string,
  assignmentsIds: string[],
  removeFields: string[] = [],
): Partial<UserCreateDto> => {
  const entity = generateCreateInput(roleId, assignmentsIds);
  removeFields.forEach(field => {
    delete entity[field];
  });

  return entity;
};
