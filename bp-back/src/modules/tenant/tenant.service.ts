import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, RoleEnum, ModuleEnum, StatusEnum } from '@prisma/client';
import { randomUUID } from 'crypto';
import { UserPayload } from 'src/auth/models/UserPayload';
import { getMessage, MessagesHelperKey } from 'src/helpers/messages.helper';
import { Languages } from 'src/utils/language-preference';
import { handleError } from 'src/utils/treat.exceptions';

import { AssignmentsDto, RoleDto } from '../user/dto/response/assignments.dto';
import {
  checkModuleAccessByRole,
  verifyRoleHasAssignedPermissions,
  getRolesWithAccessToModule,
  getRolesThatGivenRoleCanCreate,
  getRoleAllowedAssignments,
} from './tenant.helper';
import { TenantRepository } from './tenant.repository';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);
  constructor(private readonly tenantRepository: TenantRepository) {}

  async getAssignments(
    moduleName: string,
    roleId: string,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<AssignmentsDto[]> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.debug(`${identifierRequest} Get in assignments`);

      if (!moduleName || !roleId) {
        throw new BadRequestException(
          getMessage(
            MessagesHelperKey.MODULE_NAME_AND_ROLE_ID_REQUIRED,
            languagePreference,
          ),
        );
      }

      const loggedUserRole = currentUser.role as RoleEnum;
      moduleName = moduleName.trim().toUpperCase();
      roleId = roleId.trim();

      if (ModuleEnum[moduleName] == null) {
        throw new NotFoundException('Módulo não encontrado');
      }

      checkModuleAccessByRole(
        moduleName as ModuleEnum,
        loggedUserRole,
        languagePreference,
      );

      const role = await this.tenantRepository.findOneRole(
        {
          where: {
            id: roleId,
            status: StatusEnum.ACTIVE,
            deletedAt: null,
          },
          select: {
            name: true,
          },
        },
        optionals?.transaction,
      );

      if (!role) {
        throw new BadRequestException(
          getMessage(MessagesHelperKey.ROLE_NOT_FOUND, languagePreference),
        );
      }

      verifyRoleHasAssignedPermissions(
        role.name,
        loggedUserRole,
        languagePreference,
      );

      const module = await this.tenantRepository.findOneModule(
        {
          where: {
            name: moduleName as ModuleEnum,
            status: StatusEnum.ACTIVE,
          },
        },
        optionals?.transaction,
      );

      if (!module) {
        throw new NotFoundException(
          getMessage(
            MessagesHelperKey.MODULE_NOT_FOUND_OR_INACCESSIBLE,
            languagePreference,
          ),
        );
      }

      const getPermittedAssignmentsFromRole = getRoleAllowedAssignments(
        role.name,
      );

      const assignments: AssignmentsDto[] =
        await this.tenantRepository.findManyAssignments(
          {
            where: {
              status: StatusEnum.ACTIVE,
              deletedAt: null,
              name: {
                in: getPermittedAssignmentsFromRole,
              },
              ModuleAssignment: {
                some: {
                  moduleId: module.id,
                },
              },
            },
            select: {
              id: true,
              name: true,
            },
          },
          optionals?.transaction,
        );

      return assignments ?? [];
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
      throw error;
    }
  }

  async getRoles(
    moduleName: string,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<RoleDto[]> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.debug(`${identifierRequest} Get in roles`);

    try {
      if (!moduleName) {
        throw new BadRequestException(
          getMessage(
            MessagesHelperKey.MODULE_NAME_REQUIRED,
            languagePreference,
          ),
        );
      }

      const loggedUserRole: RoleEnum = currentUser.role as RoleEnum;
      moduleName = moduleName.trim().toUpperCase();

      if (ModuleEnum[moduleName] == null) {
        throw new BadRequestException(
          getMessage(MessagesHelperKey.MODULE_NOT_FOUND, languagePreference),
        );
      }

      checkModuleAccessByRole(
        moduleName as ModuleEnum,
        loggedUserRole,
        languagePreference,
      );

      const fetchRolesWithAccessToModule = getRolesWithAccessToModule(
        moduleName as ModuleEnum,
      );

      const rolesThatCanBeCreatedByLoggedUser =
        getRolesThatGivenRoleCanCreate(loggedUserRole);

      const filteredRolesToBeCreatedBy = fetchRolesWithAccessToModule.filter(
        role => rolesThatCanBeCreatedByLoggedUser.includes(role),
      );

      const roles: RoleDto[] = await this.tenantRepository.findManyRoles(
        filteredRolesToBeCreatedBy,
        optionals?.transaction,
      );

      if (roles.length === 0) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.ROLE_NOT_FOUND, languagePreference),
        );
      }

      return roles;
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }
}
