import { faker } from '@faker-js/faker';
import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { ClientHistoryCreateDto } from 'src/modules/client-history/dto/request/client-history.create.dto';
import { ClientHistoryUpdateDto } from 'src/modules/client-history/dto/request/client-history.update.dto';
import { ClientHistoryTypeMap } from 'src/modules/client-history/entity/client-history.type.map';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE AND THE MOCK VALUES
/**
 * Generates a create input object for database
 *
 * @returns {ClientHistoryTypeMap[CrudType.CREATE_UNCHECKED]} The generated create input object.
 */
export const generateCreateInput =
  (): ClientHistoryTypeMap[CrudType.CREATE_UNCHECKED] => {
    const createInput: ClientHistoryCreateDto = {
      observation: faker.lorem.sentence(),
      clientId: '',
    };

    return createInput;
  };

// TODO-GENERATOR: IMPLEMENT THE MOCK VALUES
/**
 * Generates an update input object for database
 *
 * @returns {ClientHistoryTypeMap[CrudType.UPDATE]} The generated update input object.
 */
export const generateUpdateInput =
  (): ClientHistoryTypeMap[CrudType.UPDATE] => {
    const updateInput: ClientHistoryUpdateDto = {
      version: 1,
    };

    return updateInput;
  };

/**
 * Generates a partial entity and removes specified fields.
 *
 * @param {string[]} removeFields - An array of field names to remove from the entity.
 * @returns The generated partial entity.
 */
export const generatePartialEntity = (removeFields: string[] = []) => {
  const entity = generateCreateInput();
  removeFields.forEach(field => {
    delete entity[field];
  });

  return entity;
};
