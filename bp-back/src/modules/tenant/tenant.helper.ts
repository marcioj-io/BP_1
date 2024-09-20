import {
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { RoleEnum, AssignmentsEnum, ModuleEnum } from '@prisma/client';
import {
  getMessage,
  MessagesHelperKey,
  setMessage,
} from 'src/helpers/messages.helper';
import { Languages } from 'src/utils/language-preference';

import { permissionsStructure } from './rules/tenant-rules';
import { Action } from './rules/types';

/**
 * Retrieves permitted assignments for a specific role.
 * @param role - The role to get permitted assignments for.
 * @returns An array of permitted assignments for the specified role.
 */
export const getRoleAllowedAssignments = (
  role: RoleEnum,
): AssignmentsEnum[] => {
  return fetchRoleAllowedAssignments()[role] || [];
};

/**
 * Retrieves permitted roles for a specific module.
 * @param module - The module to get permitted roles for.
 * @returns An array of permitted roles for the specified module.
 */
export const getRolesWithAccessToModule = (module: ModuleEnum): RoleEnum[] => {
  return fetchRolesWithAccessToModule()[module] || [];
};

/**
 * Retrieves a list of permitted assignments for a given module. This function is essential
 * for determining the actions (assignments) that can be performed within the context of a
 * specific module by roles with access to that module.
 *
 * @param {ModuleEnum} module - The module enum value for which to retrieve permitted assignments.
 * @returns {AssignmentsEnum[]} An array of assignments enum values that are permitted within the given module.
 * If no assignments are explicitly permitted for the module, an empty array is returned, indicating
 * that no specific actions are allowed.
 */
export const getModuleAllowedAssignments = (
  module: ModuleEnum,
): AssignmentsEnum[] => {
  return fetchModuleAllowedAssignments()[module] || [];
};

/**
 * Retrieves the roles that can be created by a given role.
 *
 * @param {RoleEnum} role The role for which creatable roles are to be fetched.
 * @returns {RoleEnum[]} An array of roles that can be created by the specified role. If no creatable roles are found, an empty array is returned.
 */
export const getRolesThatGivenCanBeCreatedBy = (role: RoleEnum): RoleEnum[] => {
  return fetchRolesCreatableByRole()[role] || [];
};

/**
 * Retorna um array de roles que podem ser criadas pela role fornecida.
 * @param {RoleEnum} givenRole - A role fornecida para verificar quais roles pode criar.
 * @returns {RoleEnum[]} Um array de roles que podem ser criadas pela role fornecida.
 */
export const getRolesThatGivenRoleCanCreate = (
  givenRole: RoleEnum,
): RoleEnum[] => {
  const rolesContainingRole = [];

  for (const role of Object.keys(permissionsStructure.roles)) {
    const canBeCreatedByRoles =
      permissionsStructure.roles[role].canBeCreatedByRoles;
    if (canBeCreatedByRoles.includes(givenRole)) {
      rolesContainingRole.push(role);
    }
  }

  return rolesContainingRole;
};

/**
 * Retrieves the roles that can be created by the specified role.
 * @param {RoleEnum} role - The role to get the roles that can be created by it.
 * @returns {RoleEnum[]} An array of roles that can be created by the specified role.
 */
export const getRoleThatCanCreateRole = (role: RoleEnum): RoleEnum[] => {
  return fetchRoleThatCanCreateRole()[role] || [];
};

/**
 * Retrieves the accessible modules for a given role.
 *
 * @param {RoleEnum} role The role for which accessible modules are to be fetched.
 * @returns {ModuleEnum[]} An array of modules accessible by the specified role. If no accessible modules are found, an empty array is returned.
 */
export const getAccessibleModulesByRole = (role: RoleEnum): ModuleEnum[] => {
  return fetchAccessibleModulesByRole()[role] || [];
};

/**
 * Validates if the specified role is allowed to be created by the logged-in user's role.
 * @param role - Role to validate.
 * @param loggedUserRole - Role of the logged-in user.
 * @param languagePreference - User's preferred language.
 * @throws ForbiddenException if the validation fails.
 */
export const verifyRoleHasAssignedPermissions = (
  role: RoleEnum,
  loggedUserRole: RoleEnum,
  languagePreference: Languages,
): void => {
  if (
    loggedUserRole === RoleEnum.ADMIN ||
    getRolesThatGivenCanBeCreatedBy(role).includes(loggedUserRole)
  ) {
    return;
  }

  throw new ForbiddenException(
    getMessage(MessagesHelperKey.NO_PERMISSION, languagePreference),
  );
};

/**
 * Retrieves the main assignment associated with a given module.
 *
 * @param {ModuleEnum} module The module for which the main assignment is to be retrieved.
 * @returns {AssignmentsEnum | null} The main assignment associated with the specified module, or null if no main assignment is found.
 */
export const getMainAssignmentFromModule = (
  module: ModuleEnum,
): AssignmentsEnum | null => {
  return permissionsStructure.modules[module]?.mainAssignment || null;
};

/**
 * Validates if the specified role is allowed for the module.
 * @param module - Module to validate.
 * @param loggedUserRole - Role of the logged-in user.
 * @param languagePreference - User's preferred language.
 * @throws ForbiddenException if the validation fails.
 */
export const checkModuleAccessByRole = (
  module: ModuleEnum,
  loggedUserRole: RoleEnum,
  languagePreference: Languages,
): void => {
  if (
    loggedUserRole === RoleEnum.ADMIN ||
    getRolesWithAccessToModule(module).includes(loggedUserRole)
  ) {
    return;
  }

  throw new ForbiddenException(
    getMessage(MessagesHelperKey.NO_PERMISSION, languagePreference),
  );
};

/**
 * Retrieves the permitted roles for each module from the permissions structure.
 * This function maps each module to an array of roles that are allowed to access it,
 * based on the centralized permissions configuration.
 *
 * @returns {Record<ModuleEnum, RoleEnum[]>} A record mapping each module to an array of permitted roles.
 */
export const fetchRolesWithAccessToModule = (): Record<
  ModuleEnum,
  RoleEnum[]
> => {
  return Object.entries(permissionsStructure.modules).reduce(
    (acc, [module, { allowedRoles }]) => {
      acc[module as ModuleEnum] = allowedRoles;
      return acc;
    },
    {} as Record<ModuleEnum, RoleEnum[]>,
  );
};

/**
 * Extracts the permitted modules for each role from the permissions structure.
 * This function determines which modules a given role has access to, facilitating
 * access control based on role assignments.
 *
 * @returns {Record<RoleEnum, ModuleEnum[]>} A record mapping each role to an array of modules it can access.
 */
export const fetchAccessibleModulesByRole = (): Record<
  RoleEnum,
  ModuleEnum[]
> => {
  return Object.entries(permissionsStructure.roles).reduce(
    (acc, [role, { accessibleModules }]) => {
      acc[role as RoleEnum] = accessibleModules;
      return acc;
    },
    {} as Record<RoleEnum, ModuleEnum[]>,
  );
};

/**
 * Defines the permitted assignments for creation based on each role.
 * This function identifies the actions or assignments a role is allowed to perform,
 * enhancing the granularity of permissions within modules.
 *
 * @returns {Record<RoleEnum, AssignmentsEnum[]>} A record mapping each role to an array of permitted assignments.
 */
export const fetchRoleAllowedAssignments = (): Record<
  RoleEnum,
  AssignmentsEnum[]
> => {
  return Object.entries(permissionsStructure.roles).reduce(
    (acc, [role, { allowedAssignments }]) => {
      acc[role as RoleEnum] = allowedAssignments;
      return acc;
    },
    {} as Record<RoleEnum, AssignmentsEnum[]>,
  );
};

/**
 * Determines the roles allowed to create a specific role.
 * This function outlines role creation capabilities, specifying which roles have the
 * authority to create or assign other roles, thus establishing a hierarchy or permissions cascade.
 *
 * @returns {Record<RoleEnum, RoleEnum[]>} A record mapping each role to an array of roles that can create it.
 */
export const fetchRolesCreatableByRole = (): Record<RoleEnum, RoleEnum[]> => {
  return Object.entries(permissionsStructure.roles).reduce(
    (acc, [role, { canBeCreatedByRoles }]) => {
      acc[role as RoleEnum] = canBeCreatedByRoles;
      return acc;
    },
    {} as Record<RoleEnum, RoleEnum[]>,
  );
};

/**
 * Retrieves the roles that can create other roles from the permissions structure.
 * @returns {Record<RoleEnum, RoleEnum[]>} An object mapping each role to an array of roles that can be created by it.
 */
export const fetchRoleThatCanCreateRole = (): Record<RoleEnum, RoleEnum[]> => {
  return Object.entries(permissionsStructure.roles).reduce(
    (acc, [role, { canBeCreatedByRoles }]) => {
      acc[role as RoleEnum] = canBeCreatedByRoles;
      return acc;
    },
    {} as Record<RoleEnum, RoleEnum[]>,
  );
};

/**
 * Extracts the permitted assignments for each module from the permissions structure.
 * This function maps each module to its allowed assignments, specifying the actions that
 * roles with access to the module are authorized to perform.
 *
 * @returns {Record<ModuleEnum, AssignmentsEnum[]>} A record mapping each module to an array of permitted assignments.
 */
export const fetchModuleAllowedAssignments = (): Record<
  ModuleEnum,
  AssignmentsEnum[]
> => {
  return Object.entries(permissionsStructure.modules).reduce(
    (acc, [module, { assignmentsThatCanBeCreatedWithinModule }]) => {
      acc[module as ModuleEnum] = assignmentsThatCanBeCreatedWithinModule;
      return acc;
    },
    {} as Record<ModuleEnum, AssignmentsEnum[]>,
  );
};

/**
 * Validates user permissions for specific module-related actions.
 *
 * This function checks if the specified module is valid and whether the current user has the appropriate
 * permissions to perform a specified action. It throws exceptions if the module is invalid or if the user
 * lacks the necessary permissions unless the user is an admin, in which case all checks are bypassed.
 *
 * @param {string} currentModule - The name of the module to check. Must be a key from `ModuleEnum`.
 * @param {RoleEnum} currentUserRole - The role of the current user. If the user is an admin, permission checks are skipped.
 * @param {'create' | 'read' | 'update' | 'delete'} action - The action the user is attempting to perform.
 * @param {Array.<{assignment: string, create: boolean, read: boolean, update: boolean, delete: boolean}>} currentUserAssignments - A list of the user's assignments and their permissions.
 * @param {{languagePreference: Languages, identifierRequest: string}} flow - Object containing details about the request, such as the user's preferred language for error messages and a unique identifier for the request.
 *
 * @throws {BadRequestException} - Throws if the current module is not provided or is invalid.
 * @throws {ForbiddenException} - Throws if the user does not have the required permissions for the action.
 *
 * @returns {void} - Returns nothing. Execution is stopped by exceptions if validations fail.
 */
export const guardModule = (
  currentModule: string,
  currentUserRole: RoleEnum,
  action: Action,
  currentUserAssignments: {
    assignment: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  }[],
  flow: {
    languagePreference: Languages;
    identifierRequest: string;
    logger: Logger;
  },
  targetUserRole?: RoleEnum,
): void => {
  if (currentModule?.trim() == null) {
    flow.logger.debug(`${flow.identifierRequest} current module is required`);
    throw new BadRequestException(
      getMessage(
        MessagesHelperKey.CURRENT_MODULE_REQUIRED,
        flow.languagePreference,
      ),
    );
  }

  if (!(currentModule?.trim() in ModuleEnum)) {
    flow.logger.debug(`${flow.identifierRequest} current module is invalid`);
    throw new BadRequestException(
      getMessage(MessagesHelperKey.INVALID_MODULE, flow.languagePreference),
    );
  }

  if (currentUserRole === RoleEnum.ADMIN) {
    flow.logger.debug(
      `${flow.identifierRequest} user is admin - skipping validating assignments module`,
    );
    return;
  }

  const mainAssignmentFromSelectedModule = getMainAssignmentFromModule(
    currentModule as ModuleEnum,
  );

  const hasAssignmentToReadUsersFromSelectedModule =
    currentUserAssignments?.some(
      assignment =>
        assignment.assignment === mainAssignmentFromSelectedModule &&
        assignment[action] === true,
    );

  if (!hasAssignmentToReadUsersFromSelectedModule) {
    throw new ForbiddenException(
      getMessage(
        MessagesHelperKey.USER_WITHOUT_PERMISSION_TO_FIND_USER,
        flow.languagePreference,
      ),
    );
  }

  if (targetUserRole) {
    const permittedRoles = getRolesWithAccessToModule(
      currentModule as ModuleEnum,
    );

    if (!permittedRoles.includes(targetUserRole as RoleEnum)) {
      const messageHelper = getMessageHelperByAction(action);
      throw new ForbiddenException(
        getMessage(messageHelper, flow.languagePreference),
      );
    }
  }
};

/**
 * Retrieves the message helper key based on the action.
 *
 * @param {string} action - The action to perform.
 * @returns {MessagesHelperKey} The message helper key for the specified action.
 */
export const getMessageHelperByAction = (action: Action): MessagesHelperKey => {
  switch (action) {
    case Action.CREATE:
      return MessagesHelperKey.USER_WITHOUT_PERMISSION_TO_CREATE_USER;
    case Action.READ:
      return MessagesHelperKey.USER_WITHOUT_PERMISSION_TO_FIND_USER;
    case Action.UPDATE:
      return MessagesHelperKey.USER_WITHOUT_PERMISSION_TO_UPDATE_USER;
    case Action.DELETE:
      return MessagesHelperKey.USER_WITHOUT_PERMISSION_TO_DELETE_USER;
    default:
      return MessagesHelperKey.NO_PERMISSION;
  }
};
