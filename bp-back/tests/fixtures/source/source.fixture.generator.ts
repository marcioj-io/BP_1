import { faker } from '@faker-js/faker';
import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { SourceCreateDto } from 'src/modules/source/dto/request/source.create.dto';
import { SourceUpdateDto } from 'src/modules/source/dto/request/source.update.dto';
import { SourceTypeMap } from 'src/modules/source/entity/source.type.map';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE AND THE MOCK VALUES
/**
 * Generates a create input object for database
 *
 * @returns {SourceTypeMap[CrudType.CREATE_UNCHECKED]} The generated create input object.
 */
export const generateCreateInput =
  (): SourceTypeMap[CrudType.CREATE_UNCHECKED] => {
    const createInput: SourceCreateDto = {
      name: '',
      description: '',
      requiredFieldsGeral: [],
      requiredFieldsPF: [],
      requiredFieldsPJ: [],
      extraInformation: [],
    };

    return createInput;
  };

// TODO-GENERATOR: IMPLEMENT THE MOCK VALUES
/**
 * Generates an update input object for database
 *
 * @returns {SourceTypeMap[CrudType.UPDATE]} The generated update input object.
 */
export const generateUpdateInput = (): SourceTypeMap[CrudType.UPDATE] => {
  const updateInput: SourceUpdateDto = {
    version: 1,
    name: '',
    requiredFieldsGeral: [],
    requiredFieldsPF: [],
    requiredFieldsPJ: [],
    extraInformation: [],
    description: '',
    application: 'INDIVIDUAL',
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
