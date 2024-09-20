import { faker } from '@faker-js/faker';
import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { PackageCreateDto } from 'src/modules/package/dto/request/package.create.dto';
import { PackageUpdateDto } from 'src/modules/package/dto/request/package.update.dto';
import { PackageTypeMap } from 'src/modules/package/entity/package.type.map';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE AND THE MOCK VALUES
/**
 * Generates a create input object for database
 *
 * @returns {PackageTypeMap[CrudType.CREATE_UNCHECKED]} The generated create input object.
 */
export const generateCreateInput =
  (): PackageTypeMap[CrudType.CREATE_UNCHECKED] => {
    const createInput: PackageCreateDto = {
      name: '',
      notes: '',
      clientId: '',
      priceRanges: undefined,
      sources: [],
    };

    return createInput;
  };

// TODO-GENERATOR: IMPLEMENT THE MOCK VALUES
/**
 * Generates an update input object for database
 *
 * @returns {PackageTypeMap[CrudType.UPDATE]} The generated update input object.
 */
export const generateUpdateInput = (): PackageTypeMap[CrudType.UPDATE] => {
  const updateInput: PackageUpdateDto = {
    version: 1,
    name: '',
    notes: '',
    clientId: '',
    priceRanges: [],
    sources: [],
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
