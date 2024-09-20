import { faker } from '@faker-js/faker';
import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { ClientCreateDto } from 'src/modules/client/dto/request/client.create.dto';
import { ClientUpdateDto } from 'src/modules/client/dto/request/client.update.dto';
import { ClientTypeMap } from 'src/modules/client/entity/client.type.map';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE AND THE MOCK VALUES
/**
 * Generates a create input object for database
 *
 * @returns {ClientTypeMap[CrudType.CREATE_UNCHECKED]} The generated create input object.
 */
export const generateCreateInput = (): ClientCreateDto => {
  const createInput: ClientCreateDto = {
    name: '',
    legalName: '',
    cnpj: '',
    stateRegistration: '',
    municipalRegistration: '',
    contactPhone: '',
    contactEmail: '',
    primaryContactPerson: '',
    primaryContactPersonTitle: '',
    generalNote: '',
    packages: [],
    user: {
      name: '',
      email: '',
    },
  };

  return createInput;
};

// TODO-GENERATOR: IMPLEMENT THE MOCK VALUES
/**
 * Generates an update input object for database
 *
 * @returns {ClientTypeMap[CrudType.UPDATE]} The generated update input object.
 */
export const generateUpdateInput = (): ClientUpdateDto => {
  const updateInput: ClientUpdateDto = {
    version: 1,
    name: '',
    legalName: '',
    cnpj: '',
    stateRegistration: '',
    municipalRegistration: '',
    contactPhone: '',
    contactEmail: '',
    primaryContactPerson: '',
    primaryContactPersonTitle: '',
    generalNote: '',
    packages: [],
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
