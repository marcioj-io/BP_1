import { ModuleEnum, RoleEnum, AssignmentsEnum } from '@prisma/client';

import { PermissionsStructure } from './types';

/**
 * Docs on readme - [Tenant](#tenant)
 * Defines the permissions structure within the system, categorizing permissions by modules and roles.
 * This function constructs a permissions structure object that manages access control,
 * dictating permissible actions within each module by different roles and delineating role hierarchies and creation capabilities.
 *
 * @function permissionsStructure
 * @returns {PermissionsStructure} The permissions structure object containing modules and roles with their respective permissions.
 * @example
 *
 * Module
 * The `ADMIN` module allows both admin and user roles to access it.
 * Users with access to this module can create users.
 * The `USER` assignment is the main assignment for this module, allowing users to manipulate data within the module.
 *
 * Role
 * The `USER` role has access to the `ADMIN` module.
 * Users with this role can perform user-related actions.
 * This role can be created by ´canBeCreatedByRoles` user roles.
 */
export const permissionsStructure: PermissionsStructure = {
  modules: {
    [ModuleEnum.ADMIN]: {
      allowedRoles: [RoleEnum.ADMIN, RoleEnum.USER],
      assignmentsThatCanBeCreatedWithinModule: [
        AssignmentsEnum.USER,
        AssignmentsEnum.CLIENT_HISTORY,
        AssignmentsEnum.CLIENT,
        AssignmentsEnum.SOURCE,
        AssignmentsEnum.PACKAGE,
        AssignmentsEnum.COST_CENTER,
        AssignmentsEnum.EVENT,
      ],
      mainAssignment: AssignmentsEnum.USER,
    },
    [ModuleEnum.USER]: {
      allowedRoles: [RoleEnum.ADMIN, RoleEnum.USER],
      assignmentsThatCanBeCreatedWithinModule: [
        AssignmentsEnum.USER,
        AssignmentsEnum.CLIENT_HISTORY,
        AssignmentsEnum.CLIENT,
        AssignmentsEnum.SOURCE,
        AssignmentsEnum.PACKAGE,
        AssignmentsEnum.COST_CENTER,
        AssignmentsEnum.EVENT,
      ],
      mainAssignment: AssignmentsEnum.USER,
    },
    [ModuleEnum.CLIENT]: {
      allowedRoles: [RoleEnum.ADMIN, RoleEnum.USER],
      assignmentsThatCanBeCreatedWithinModule: [RoleEnum.ADMIN, RoleEnum.USER],
      mainAssignment: AssignmentsEnum.CLIENT,
    },
    [ModuleEnum.SOURCE]: {
      allowedRoles: [RoleEnum.ADMIN, RoleEnum.USER],
      assignmentsThatCanBeCreatedWithinModule: [RoleEnum.ADMIN],
      mainAssignment: AssignmentsEnum.SOURCE,
    },
    [ModuleEnum.PACKAGE]: {
      allowedRoles: [RoleEnum.ADMIN, RoleEnum.USER],
      assignmentsThatCanBeCreatedWithinModule: [RoleEnum.ADMIN],
      mainAssignment: AssignmentsEnum.PACKAGE,
    },
    [ModuleEnum.COST_CENTER]: {
      allowedRoles: [RoleEnum.ADMIN, RoleEnum.USER],
      assignmentsThatCanBeCreatedWithinModule: [RoleEnum.ADMIN],
      mainAssignment: AssignmentsEnum.COST_CENTER,
    },
    [ModuleEnum.EVENT]: {
      allowedRoles: [RoleEnum.ADMIN, RoleEnum.USER],
      assignmentsThatCanBeCreatedWithinModule: [RoleEnum.ADMIN],
      mainAssignment: AssignmentsEnum.EVENT,
    },
    [ModuleEnum.CLIENT_HISTORY]: {
      allowedRoles: [RoleEnum.ADMIN, RoleEnum.USER],
      assignmentsThatCanBeCreatedWithinModule: [RoleEnum.ADMIN],
      mainAssignment: AssignmentsEnum.EVENT,
    },
  },
  roles: {
    [RoleEnum.USER]: {
      accessibleModules: [
        ModuleEnum.ADMIN,
        ModuleEnum.USER,
        ModuleEnum.CLIENT,
        ModuleEnum.SOURCE,
        ModuleEnum.PACKAGE,
        ModuleEnum.COST_CENTER,
        ModuleEnum.EVENT,
        ModuleEnum.CLIENT_HISTORY,
      ],
      allowedAssignments: [
        AssignmentsEnum.USER,
        AssignmentsEnum.CLIENT,
        AssignmentsEnum.SOURCE,
        AssignmentsEnum.PACKAGE,
        AssignmentsEnum.COST_CENTER,
        AssignmentsEnum.EVENT,
        AssignmentsEnum.CLIENT_HISTORY,
      ],
      canBeCreatedByRoles: [RoleEnum.ADMIN, RoleEnum.USER],
    },
    [RoleEnum.ADMIN]: {
      accessibleModules: [
        ModuleEnum.ADMIN,
        ModuleEnum.USER,
        ModuleEnum.CLIENT,
        ModuleEnum.SOURCE,
        ModuleEnum.PACKAGE,
        ModuleEnum.COST_CENTER,
        ModuleEnum.EVENT,
        ModuleEnum.CLIENT_HISTORY,
      ],
      allowedAssignments: [
        AssignmentsEnum.USER,
        AssignmentsEnum.CLIENT,
        AssignmentsEnum.SOURCE,
        AssignmentsEnum.PACKAGE,
        AssignmentsEnum.COST_CENTER,
        AssignmentsEnum.EVENT,
        AssignmentsEnum.CLIENT_HISTORY,
      ],
      canBeCreatedByRoles: [RoleEnum.ADMIN],
    },
  },
};
