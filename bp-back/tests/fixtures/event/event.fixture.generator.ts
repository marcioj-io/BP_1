import { CrudType } from 'src/modules/base/interfaces/ICrudTypeMap';
import { EventCreateDto } from 'src/modules/event/dto/request/event.create.dto';
import { EventTypeMap } from 'src/modules/event/entity/event.type.map';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE AND THE MOCK VALUES
/**
 * Generates a create input object for database
 *
 * @returns {EventTypeMap[CrudType.CREATE_UNCHECKED]} The generated create input object.
 */
export const generateCreateInput =
  (): EventTypeMap[CrudType.CREATE_UNCHECKED] => {
    const createInput: EventCreateDto = {
      ip: '',
      event: 'LOGIN',
      additionalData: '',
      description: '',
      userId: '',
    };

    return createInput;
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
