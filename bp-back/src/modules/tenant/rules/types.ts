import { RoleEnum, AssignmentsEnum, ModuleEnum } from '@prisma/client';

type ModulePermissions = {
  allowedRoles: RoleEnum[];
  assignmentsThatCanBeCreatedWithinModule: AssignmentsEnum[];
  mainAssignment: AssignmentsEnum;
};

type RolePermissions = {
  accessibleModules: ModuleEnum[];
  allowedAssignments: AssignmentsEnum[];
  canBeCreatedByRoles: RoleEnum[];
};

export type PermissionsStructure = {
  modules: Record<ModuleEnum, ModulePermissions>;
  roles: Record<RoleEnum, RolePermissions>;
};

export enum Action {
  'READ' = 'read',
  'CREATE' = 'create',
  'UPDATE' = 'update',
  'DELETE' = 'delete',
}
