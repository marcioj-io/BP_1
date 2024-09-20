import { faker } from '@faker-js/faker';
import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { CostCenterCreateDto } from 'src/modules/cost-center/dto/request/cost-center.create.dto';
import { CostCenterUpdateDto } from 'src/modules/cost-center/dto/request/cost-center.update.dto';
import { CostCenterTypeMap } from 'src/modules/cost-center/entity/cost-center.type.map';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE AND THE MOCK VALUES
/**
 * Generates a create input object for database
 *
 * @returns {CostCenterTypeMap[CrudType.CREATE_UNCHECKED]} The generated create input object.
 */
export const generateCreateInput =
  (): CostCenterTypeMap[CrudType.CREATE_UNCHECKED] => {
    const createInput: CostCenterCreateDto = {
      name: '',
      description: '',
      status: 'INACTIVE',
    };

    return createInput;
  };

// TODO-GENERATOR: IMPLEMENT THE MOCK VALUES
/**
 * Generates an update input object for database
 *
 * @returns {CostCenterTypeMap[CrudType.UPDATE]} The generated update input object.
 */
export const generateUpdateInput = (): CostCenterTypeMap[CrudType.UPDATE] => {
  const updateInput: CostCenterUpdateDto = {
    version: 1,
    name: '',
    description: '',
    status: 'ACTIVE',
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
