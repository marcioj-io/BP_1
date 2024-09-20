import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AssignmentsEnum,
  LogActionEnum,
  LogStatusEnum,
  MethodEnum,
  ModuleEnum,
  Prisma,
  RoleEnum,
  StatusEnum,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { isNumber } from 'class-validator';
import { randomUUID } from 'crypto';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import {
  MessagesHelperKey,
  getMessage,
  setMessage,
} from 'src/helpers/messages.helper';
import {
  AuditLog,
  AuditLogRequestInformation,
} from 'src/middlewares/interface/logger';
import { isDevelopmentEnviroment } from 'src/utils/environment';
import { guardUser } from 'src/utils/guards/guard-user';
import { hashData } from 'src/utils/hash';
import { Languages } from 'src/utils/language-preference';
import { hasOptionalMapper } from 'src/utils/optional';
import { handleError } from 'src/utils/treat.exceptions';

import { BaseEntitySelect } from '../base/base.entity';
import { IBaseService } from '../base/interfaces/IBaseService';
import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { BucketS3Service } from '../infra/s3/bucket.service';
import { LogService } from '../log/log.service';
import { Action } from '../tenant/rules/types';
import {
  checkModuleAccessByRole,
  getRoleAllowedAssignments,
  getRolesThatGivenCanBeCreatedBy,
  getRolesWithAccessToModule,
  guardModule,
} from '../tenant/tenant.helper';
import { WebsocketService } from '../websocket/websocket.service';
import { DefaultFilterUser } from './dto/request/filters.personal.dto';
import { UpdateUserPersonalData } from './dto/request/update.personal.data.dto';
import { UpdateUserPassword } from './dto/request/update.personal.password.dto';
import { UserRestrictionBody } from './dto/request/user.block.dto';
import { UserCreateDto } from './dto/request/user.create.dto';
import { UserUpdateDto } from './dto/request/user.update.dto';
import { RoleForFilterDto } from './dto/response/assignments.dto';
import { UserPaginationResponse } from './dto/response/user.pagination.response';
import { TUserPagination } from './dto/type/user.pagination';
import { UserEntity } from './entity/user.entity';
import { UserTypeMap } from './entity/user.type.map';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(
    protected readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly logService: LogService,
    private readonly websocketService: WebsocketService,
    private readonly prisma: PrismaService,
    private readonly bucketS3Service: BucketS3Service,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createUserAsync(
    clientId: string,
    costCenters: string[],
    ownsClient: boolean,
    adminUser: boolean,
    data: UserTypeMap[CrudType.CREATE],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<UserEntity> {
    const { identifierRequest = randomUUID(), transaction } = optionals || {};
    this.logger.log(`${identifierRequest} Create user`);

    try {
      const trans =
        transaction ||
        (await this.prisma.$transaction(
          async newTransaction => newTransaction,
        ));
      const isAdmin = currentUser.role === RoleEnum.ADMIN;

      if (
        (await this.exists(
          { email: data.email.trim(), deletedAt: null },
          currentUser,
          languagePreference,
          { transaction },
        )) === true
      ) {
        this.logger.debug(`${identifierRequest} Email already exists`);
        throw new ConflictException(
          getMessage(
            MessagesHelperKey.EMAIL_ALREADY_EXISTS,
            languagePreference,
          ),
        );
      }

      if (!costCenters || costCenters.length === 0 || adminUser) {
        throw new BadRequestException(
          setMessage(
            getMessage(MessagesHelperKey.COST_CENTER_EMPTY, languagePreference),
            '0',
            'Centro de custo não pode estar vazio !',
          ),
        );
      }

      const clientExists = await trans.client.findUnique({
        where: { id: clientId ?? '' },
      });

      if (!clientExists) {
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
            clientId,
          ),
        );
      }

      if (currentUser.clientId !== clientId && !isAdmin) {
        throw new ForbiddenException(
          setMessage(
            getMessage(MessagesHelperKey.ACCESS_DENIED, languagePreference),
            clientId,
          ),
        );
      }

      const newUser = await this.userRepository.createAsync(
        { ...data, ownsClient, client: { connect: { id: clientId } } },
        trans,
      );

      await this.createOrUpdateCostCenter(
        { costCenters: costCenters, userId: newUser.id },
        {
          languagePreference,
          identifierRequest,
          transact: transaction,
        },
      );

      return newUser;
    } catch (error) {
      this.logger.debug(`${identifierRequest} rollin back transaction`);
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async createUserAdminAsync(
    sources: string[],
    adminUser: boolean,
    data: UserTypeMap[CrudType.CREATE],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<UserEntity> {
    const { identifierRequest = randomUUID(), transaction } = optionals || {};
    this.logger.log(`${identifierRequest} Create user Admin`);

    try {
      const trans =
        transaction ||
        (await this.prisma.$transaction(
          async newTransaction => newTransaction,
        ));
      const isAdmin = currentUser.role === RoleEnum.ADMIN;

      if (
        (await this.exists(
          { email: data.email.trim(), deletedAt: null },
          currentUser,
          languagePreference,
          { transaction },
        )) === true
      ) {
        this.logger.debug(`${identifierRequest} Email already exists`);
        throw new ConflictException(
          getMessage(
            MessagesHelperKey.EMAIL_ALREADY_EXISTS,
            languagePreference,
          ),
        );
      }

      if (!isAdmin) {
        throw new ForbiddenException(
          setMessage(
            getMessage(MessagesHelperKey.ACCESS_DENIED, languagePreference),
            currentUser.id,
            'User not permission',
          ),
        );
      }

      // if (!sources || sources.length === 0 || !adminUser) {
      //   throw new BadRequestException(
      //     setMessage(
      //       getMessage(MessagesHelperKey.SOURCE_EMPTY, languagePreference),
      //       'Fontes de pesquisa não pode estar vazio !',
      //     ),
      //   );
      // }

      const newUser = await this.userRepository.createAsync({ ...data }, trans);

      if (sources && sources.length > 0) {
        await this.createOrUpdateSource(
          { sources: sources, userId: newUser.id },
          {
            languagePreference,
            identifierRequest,
            transact: transaction,
          },
        );
      }

      return newUser;
    } catch (error) {
      this.logger.debug(`${identifierRequest} rollin back transaction`);
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async updateAsync(
    id: string,
    data: UserUpdateDto,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      currentModule: string;
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Partial<UserEntity>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.log(`${identifierRequest} Update user`);

    const executeUpdate = async (transaction: Prisma.TransactionClient) => {
      if (currentUser.id === id) {
        this.logger.warn(
          `${identifierRequest} User is trying to update itself, returning without changes`,
        );

        throw new ForbiddenException(
          getMessage(
            MessagesHelperKey.USER_UPDATE_YOURSELF,
            languagePreference,
          ),
        );
      }

      if (id == null || id.trim() == '') {
        this.logger.debug(`${identifierRequest} Id is required`);
        throw new BadRequestException(
          getMessage(MessagesHelperKey.ID_REQUIRED, languagePreference),
        );
      }

      const userBeingEdited = await this.userRepository.findByIdAsync(
        id,
        optionals?.transaction,
      );

      if (!userBeingEdited) {
        this.logger.debug(`${identifierRequest} User not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
            id,
          ),
        );
      }

      let role = userBeingEdited?.Role?.name as RoleEnum;

      guardModule(
        optionals?.currentModule as ModuleEnum,
        currentUser.role as RoleEnum,
        Action.UPDATE,
        currentUser?.assignments,
        {
          languagePreference,
          identifierRequest,
          logger: this.logger,
        },
        userBeingEdited.Role.name as RoleEnum,
      );

      const userUpdateInput: Prisma.UserUpdateInput = {
        version: data.version,
      };

      if (data.name) userUpdateInput.name = data.name;
      if (data.status) userUpdateInput.status = data.status;

      if (data.email) {
        if (
          (await this.exists(
            { email: data.email, id: { not: id } },
            currentUser,
            languagePreference,
            { transaction },
          )) === true
        ) {
          this.logger.debug(`${identifierRequest} Email already exists`);
          throw new ConflictException(
            getMessage(
              MessagesHelperKey.EMAIL_ALREADY_EXISTS,
              languagePreference,
            ),
          );
        }

        userUpdateInput.email = data.email;
      }

      if (data.mediaUrl) {
        this.logger.debug(`${identifierRequest} Has mediaUrl`);

        userUpdateInput.Media = {
          upsert: {
            where: {
              id: userBeingEdited?.mediaId || undefined,
            },
            create: {
              url: data.mediaUrl,
            },
            update: {
              url: data.mediaUrl,
            },
          },
        };
      }

      if (data.roleId) {
        this.logger.debug(`${identifierRequest} Updating role`);

        const roleDb = await this.userRepository.findOneRole(
          {
            where: {
              id: data.roleId,
            },
            select: {
              name: true,
            },
          },
          transaction,
        );

        if (!roleDb) {
          throw new BadRequestException(
            getMessage(MessagesHelperKey.ROLE_NOT_FOUND, languagePreference),
          );
        }

        //nao seria com base no id do currentUser ?
        // Check if the current user has permission to assign the role
        const hasPermissionToUpdate = (roleDb.name as RoleEnum).includes(
          currentUser.role as RoleEnum,
        );

        if (!hasPermissionToUpdate) {
          throw new ForbiddenException(
            getMessage(
              MessagesHelperKey.ROLE_NOT_PERMITTED_TO_UPSERT_USER_WITH_ROLE,
              languagePreference,
            ),
          );
        }

        userUpdateInput.Role = {
          connect: {
            id: data.roleId,
          },
        };

        role = roleDb.name;
      }

      if (data.assignments && data.assignments.length > 0) {
        this.logger.debug(`${identifierRequest} Update assignments`);

        await this.userRepository.removeAllAssignments(id, transaction);

        const assignments = await this.userRepository.findManyAssignments(
          {
            where: {
              id: {
                in: data?.assignments.map(
                  assignment => assignment?.assignmentId,
                ),
              },
            },
            select: {
              name: true,
            },
          },
          transaction,
        );

        if (
          !assignments.length ||
          assignments.length !== data.assignments.length
        ) {
          throw new BadRequestException(
            getMessage(
              MessagesHelperKey.ASSIGNMENTS_NOT_FOUND,
              languagePreference,
            ),
          );
        }

        const requestAssignmentNames: AssignmentsEnum[] = assignments.map(
          assignment => assignment.name,
        );

        const permittedAssignments = getRoleAllowedAssignments(role);

        // Check if all requested assignments are allowed for the role
        const allAssignmentsValid = requestAssignmentNames.every(
          assignmentName => permittedAssignments.includes(assignmentName),
        );

        if (!allAssignmentsValid) {
          throw new ForbiddenException(
            getMessage(
              MessagesHelperKey.ASSIGNMENT_NOT_PERMITTED_FOR_ROLE,
              languagePreference,
            ),
          );
        }

        // If there is create, update or delete permission without read permission, it will be added
        data.assignments = data.assignments.map(assignment => {
          if (
            (assignment.create || assignment.update || assignment.delete) &&
            !assignment.read
          ) {
            assignment.read = true;
          }

          return assignment;
        });

        userUpdateInput.UserAssignment = {
          create: data.assignments.map(assignment => ({
            create: assignment.create,
            read: assignment.read,
            update: assignment.update,
            delete: assignment.delete,
            Assignment: {
              connect: {
                id: assignment.assignmentId,
              },
            },
          })),
        };
      } else {
        await this.userRepository.removeAllAssignments(id, transaction);
      }

      if (data.costCenters && data.costCenters.length > 0) {
        await this.createOrUpdateCostCenter(
          { costCenters: data.costCenters, userId: id },
          {
            languagePreference,
            identifierRequest,
            transact: transaction,
          },
        );
      } else {
        await transaction.userCostCenter.deleteMany({
          where: {
            userId: id,
          },
        });
      }

      if (data.sources && data.sources.length > 0) {
        await this.createOrUpdateSource(
          { sources: data.sources, userId: id },
          {
            languagePreference,
            identifierRequest,
            transact: transaction,
          },
        );
      } else {
        await transaction.userSource.deleteMany({
          where: {
            userId: id,
          },
        });
      }

      const userUpdated = await this.userRepository.updateAsync(
        id,
        userUpdateInput,
        transaction,
      );

      // Used to maintain history of changes for the user and who edited it
      const userPreUpdateJson =
        this.getUserPreUpdateToAuditLogs(userBeingEdited);

      await this.logService.createAuditLog(
        new AuditLog(
          'update',
          currentUser.ip,
          `/usuarios/${id}`,
          MethodEnum.PUT,
          currentUser.email,
          LogStatusEnum.SUCCESS,
          LogActionEnum.UPDATE,
          setMessage(
            getMessage(MessagesHelperKey.USER_UPDATED_SUCCESS, 'pt-BR'),
            userBeingEdited.email,
            userPreUpdateJson,
          ),
        ),
        {
          identifierRequest,
          transaction: transaction,
        },
      );

      this.logger.debug(`${identifierRequest} User history created for logs`);

      return userUpdated;
    };

    try {
      if (optionals?.transaction) {
        this.logger.debug(`${identifierRequest} Executing in transaction`);

        return await executeUpdate(optionals?.transaction);
      } else {
        this.logger.debug(
          `${identifierRequest} Transaction doesn't exists, creating a new transaction`,
        );

        return this.prisma.$transaction(async newTransaction => {
          return await executeUpdate(newTransaction);
        });
      }
    } catch (error) {
      this.logger.debug(`${identifierRequest} rollin back transaction`);

      await this.logService.createAuditLog(
        new AuditLog(
          'update',
          currentUser.ip,
          `/usuarios/${id}`,
          MethodEnum.PUT,
          currentUser.email,
          LogStatusEnum.ERROR,
          LogActionEnum.UPDATE,
          setMessage(
            getMessage(MessagesHelperKey.USER_UPDATED_ERROR, 'pt-BR'),
            id,
          ),
        ),
        {
          identifierRequest,
        },
      );

      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  private async createOrUpdateSource(
    { sources, userId },
    optionals?: {
      languagePreference?: Languages;
      identifierRequest?: string;
      transact?: Prisma.TransactionClient;
    },
  ) {
    try {
      const transaction =
        optionals?.transact ||
        (await this.prisma.$transaction(
          async newTransaction => newTransaction,
        ));

      await transaction.userSource.deleteMany({
        where: {
          userId: userId,
        },
      });

      const sourcePromises = sources.map(id =>
        transaction.source.findUnique({ where: { id } }),
      );
      const sourcesResults = await Promise.all(sourcePromises);
      const notFoundSourcesIds = sourcesResults.reduce(
        (ids, result, index) => (result ? ids : [...ids, sources[index]]),
        [] as string[],
      );

      if (notFoundSourcesIds.length > 0) {
        const message = `Sources with id's ${notFoundSourcesIds.join(', ')} not found`;
        this.logger.debug(message);
        throw new NotFoundException(
          setMessage(
            getMessage(
              MessagesHelperKey.SOURCE_NOT_FOUND,
              optionals?.languagePreference,
            ),
            notFoundSourcesIds.join(', '),
            message,
          ),
        );
      }

      const userSourcesCreateorUpdate = sources.map(sourceId => {
        return transaction.userSource.create({
          data: {
            sourceId: sourceId,
            userId: userId,
          },
        });
      });

      return await Promise.all(userSourcesCreateorUpdate);
    } catch (error) {
      const identifierReq = optionals?.identifierRequest || randomUUID();

      handleError(error, optionals?.languagePreference, {
        identifierRequest: identifierReq,
        message:
          error.message || 'Não foi possivel atualizar as fontes de pesquisa',
      });

      throw error;
    }
  }

  private async createOrUpdateCostCenter(
    { costCenters, userId },
    optionals?: {
      languagePreference?: Languages;
      identifierRequest?: string;
      transact?: Prisma.TransactionClient;
    },
  ) {
    try {
      const transaction =
        optionals?.transact ||
        (await this.prisma.$transaction(
          async newTransaction => newTransaction,
        ));

      await transaction.userCostCenter.deleteMany({
        where: {
          userId: userId,
        },
      });

      const costCenterPromises = costCenters.map(id =>
        transaction.costCenter.findUnique({ where: { id } }),
      );
      const costCentersResults = await Promise.all(costCenterPromises);
      const notFoundCostCentersIds = costCentersResults.reduce(
        (ids, result, index) => (result ? ids : [...ids, costCenters[index]]),
        [] as string[],
      );

      if (notFoundCostCentersIds.length > 0) {
        const message = `Cost center with id's ${notFoundCostCentersIds.join(', ')} not found`;
        this.logger.debug(message);
        throw new NotFoundException(
          setMessage(
            getMessage(
              MessagesHelperKey.COST_CENTER_NOT_FOUND,
              optionals?.languagePreference,
            ),
            notFoundCostCentersIds.join(', '),
            message,
          ),
        );
      }

      const userCostCenterCreations = costCenters.map(costCenterId => {
        return transaction.userCostCenter.create({
          data: {
            costCenterId: costCenterId,
            userId: userId,
          },
        });
      });

      await Promise.all(userCostCenterCreations);
    } catch (error) {
      const identifierReq = optionals?.identifierRequest || randomUUID();

      handleError(error, optionals?.languagePreference, {
        identifierRequest: identifierReq,
        message:
          error.message || 'Não foi possivel atualizar os centros de custo',
      });

      throw error;
    }
  }

  async deleteAsync(
    id: string,
    version: number,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      currentModule?: string;
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<void> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.log(`${identifierRequest} Delete user`);

    if (id == null || id.trim() == '') {
      this.logger.debug(`${identifierRequest} Id is required`);
      throw new BadRequestException(
        getMessage(MessagesHelperKey.ID_REQUIRED, languagePreference),
      );
    }

    const executeDelete = async (transaction: Prisma.TransactionClient) => {
      if (
        (await this.exists({ id }, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} User not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
            id,
          ),
        );
      }

      const userExists = await this.exists(
        { id },
        currentUser,
        languagePreference,
        {
          transaction,
        },
      );

      if (!userExists) {
        this.logger.debug(`${identifierRequest} User not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
            id,
          ),
        );
      }

      const userToBeDeleted = await this.userRepository.findByIdAsync(
        id,
        optionals?.transaction,
      );

      // if (
      //   !userToBeDeleted ||
      //   userToBeDeleted.deletedAt != null ||
      //   userToBeDeleted.status === StatusEnum.INACTIVE
      // ) {
      //   throw new ForbiddenException(
      //     setMessage(
      //       getMessage(MessagesHelperKey.USER_INACTIVE, languagePreference),
      //       id,
      //     ),
      //   );
      // }

      guardModule(
        optionals?.currentModule as ModuleEnum,
        currentUser.role as RoleEnum,
        Action.DELETE,
        currentUser?.assignments,
        {
          languagePreference,
          identifierRequest,
          logger: this.logger,
        },
        userToBeDeleted.Role.name as RoleEnum,
      );

      await this.userRepository.deleteAsync(id, version, transaction);

      await this.logService.createAuditLog(
        new AuditLog(
          'delete',
          currentUser.ip,
          `/usuarios/${id}`,
          MethodEnum.DELETE,
          currentUser.email,
          LogStatusEnum.SUCCESS,
          LogActionEnum.DELETE,
          setMessage(
            getMessage(MessagesHelperKey.USER_DELETED_SUCCESS, 'pt-BR'),
            userToBeDeleted.email,
          ),
        ),
        {
          identifierRequest,
          transaction: transaction,
        },
      );
    };

    try {
      if (optionals?.transaction) {
        this.logger.debug(`${identifierRequest} Executing in transaction`);

        await executeDelete(optionals?.transaction);
      } else {
        this.logger.debug(
          `${identifierRequest} Transaction doesn't exists, creating a new transaction`,
        );

        await this.prisma.$transaction(async newTransaction => {
          await executeDelete(newTransaction);
        });
      }
    } catch (error) {
      this.logger.debug(`${identifierRequest} rollin back transaction`);

      await this.logService.createAuditLog(
        new AuditLog(
          'delete',
          currentUser.ip,
          `/usuarios/${id}`,
          MethodEnum.DELETE,
          currentUser.email,
          LogStatusEnum.ERROR,
          LogActionEnum.DELETE,
          setMessage(
            getMessage(MessagesHelperKey.USER_DELETED_ERROR, 'pt-BR'),
            id,
          ),
        ),
        {
          identifierRequest,
        },
      );

      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async findByIdAsync<S, T>(
    id: string,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      currentModule: string;
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<UserEntity | T> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();

    try {
      this.logger.log(`${identifierRequest} Find by id`);

      if (id == null || id.trim() == '') {
        this.logger.debug(`${identifierRequest} Id is required`);
        throw new BadRequestException(
          getMessage(MessagesHelperKey.ID_REQUIRED, languagePreference),
        );
      }

      if (
        (await this.exists({ id }, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} User not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
            id,
          ),
        );
      }

      const user = await this.userRepository.findByIdAsync(
        id,
        optionals?.transaction,
      );

      // if (
      //   !user ||
      //   user.deletedAt != null ||
      //   user.status == StatusEnum.INACTIVE
      // ) {
      //   throw new ForbiddenException(
      //     setMessage(
      //       getMessage(MessagesHelperKey.USER_INACTIVE, languagePreference),
      //       id,
      //     ),
      //   );
      // }

      guardModule(
        optionals?.currentModule as ModuleEnum,
        currentUser.role as RoleEnum,
        Action.READ,
        currentUser?.assignments,
        {
          languagePreference,
          identifierRequest,
          logger: this.logger,
        },
        user.Role.name as RoleEnum,
      );

      if (hasOptionalMapper(optionals)) {
        const destination = optionals.mapper.destinationClass;
        const source = optionals.mapper.sourceClass;
        const mapperToArray = Array.isArray(user);

        const userData = this.mapperEntity<S, InstanceType<typeof destination>>(
          user as InstanceType<typeof source>,
          source,
          destination,
          mapperToArray,
        ) as T;
        return {
          ...userData,
          clientId: user.clientId,
          costCenters: user.costCenters.map(item => {
            return {
              id: item.costCenter.id,
              name: item.costCenter.name,
            };
          }),
          sources: user.sources.map(item => {
            return {
              id: item.Source.id,
              name: item.Source.name,
            };
          }),
        };
      }

      return user;
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async exists(
    where: UserTypeMap[CrudType.WHERE],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<boolean> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} exists`);

      return await this.userRepository.exists(where, optionals?.transaction);
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async findBy<S, T>(
    where: UserTypeMap[CrudType.WHERE],
    select: UserTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: UserTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<Partial<UserEntity> | T> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} User not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
            '',
          ),
        );
      }

      const data = await this.userRepository.findBy(
        where,
        select,
        optionals?.orderBy,
        optionals?.transaction,
      );

      if (hasOptionalMapper(optionals)) {
        const destination = optionals.mapper.destinationClass;
        const source = optionals.mapper.sourceClass;
        const mapperToArray = Array.isArray(data);

        return this.mapperEntity<S, InstanceType<typeof destination>>(
          data as InstanceType<typeof source>,
          source,
          destination,
          mapperToArray,
        ) as T;
      }

      return data;
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async findAllBy<S, T>(
    where: UserTypeMap[CrudType.WHERE],
    select: UserTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: UserTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<Partial<UserEntity>[] | T[]> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find all by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} User not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.USERS_NOT_FOUND, languagePreference),
        );
      }

      const data = await this.userRepository.findAllBy(
        where,
        select,
        optionals?.orderBy,
        optionals?.transaction,
      );

      if (hasOptionalMapper(optionals)) {
        const destination = optionals.mapper.destinationClass;
        const source = optionals.mapper.sourceClass;
        const mapperToArray = Array.isArray(data);

        return this.mapperEntity<S, InstanceType<typeof destination>>(
          data as InstanceType<typeof source>,
          source,
          destination,
          mapperToArray,
        ) as T[];
      }

      return data;
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async findFilteredAsync(
    filter: DefaultFilterUser,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      currentModule?: string;
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Paginated<Partial<UserPaginationResponse>>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find filtered async`);

      guardModule(
        optionals?.currentModule as ModuleEnum,
        currentUser.role as RoleEnum,
        Action.READ,
        currentUser?.assignments,
        {
          languagePreference,
          identifierRequest,
          logger: this.logger,
        },
      );

      const getPermittedRolesFromSelectedModule = getRolesWithAccessToModule(
        optionals?.currentModule as ModuleEnum,
      );

      const filterFromSelectedModule = this.getFilterQueryFromSelectedModule(
        optionals.currentModule as ModuleEnum,
        filter?.search,
      );

      if (filter?.search && RoleEnum[filter?.search?.toUpperCase()] != null) {
        const roleIsPermitted = getPermittedRolesFromSelectedModule.includes(
          filter.search.toUpperCase() as RoleEnum,
        );

        if (!roleIsPermitted) {
          throw new ForbiddenException(
            getMessage(
              MessagesHelperKey.FILTER_ROLE_NOT_PERMITTED_TO_MODULE,
              languagePreference,
            ),
          );
        }
      } else {
        filterFromSelectedModule.push({
          Role: {
            name: {
              in: getPermittedRolesFromSelectedModule,
            },
          },
        });
      }

      const selectQuery = this.getSelectQueryFromSelectedModule(
        optionals.currentModule as ModuleEnum,
      );

      const { page, perPage, status, order, orderBy } = filter;

      const filterQuery: DefaultFilter<UserTypeMap> = {
        page,
        perPage,
        query: filterFromSelectedModule,
        select: selectQuery,
        order,
        status,
        orderBy,
      };

      const userFiltered = await this.userRepository.findFilteredAsync(
        filterQuery,
        currentUser,
        optionals?.transaction,
      );

      const userFilteredDataMapped = this.mapper.mapArray(
        userFiltered.data,
        TUserPagination,
        UserPaginationResponse,
      );

      return {
        ...userFiltered,
        data: userFilteredDataMapped,
      };
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async findByEmail(
    email: string,
    languagePreference: Languages,
    optionals?: {
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find by email`);

      const user = await this.userRepository.findByEmail(
        email,
        optionals?.transaction,
      );

      return user;
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async blockUsers(
    body: UserRestrictionBody,
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest || randomUUID();

    const functionName = 'blockUsers';

    this.logger.debug(`${identifierRequest} Block users`);

    try {
      await this.userRepository.changeUserRestriction(
        body.id,
        body.version,
        'BLOCK',
        optionals?.transaction,
      );

      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          currentUser.email,
          LogStatusEnum.SUCCESS,
          LogActionEnum.BLOCK,
          setMessage(
            getMessage(MessagesHelperKey.USER_BLOCKED_BY_ADMIN, 'pt-BR'),
            body.id,
          ),
        ),
        {
          identifierRequest,
          transaction: optionals?.transaction,
        },
      );

      this.websocketService.handleDisconnectUserBlocked(body.id);

      this.logger.debug(`${identifierRequest} Event disconnect emitted`);

      this.logger.debug(`${identifierRequest} blocked user ${body.id}`);

      return;
    } catch (error) {
      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          currentUser.email,
          LogStatusEnum.ERROR,
          LogActionEnum.BLOCK,
          setMessage(
            getMessage(MessagesHelperKey.USER_BLOCKED_BY_ADMIN, 'pt-BR'),
            body.id,
          ),
        ),
        {
          identifierRequest,
        },
      );

      handleError(error, languagePreference, {
        identifierRequest,
        message: getMessage(MessagesHelperKey.BLOCK_ERROR, languagePreference),
      });
    }
  }

  async unblockUsers(
    body: UserRestrictionBody,
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest || randomUUID();

    const functionName = 'unblockUsers';

    this.logger.debug(`${identifierRequest} Unblock users`);

    try {
      await this.userRepository.changeUserRestriction(
        body.id,
        body.version,
        'UNBLOCK',
        optionals?.transaction,
      );

      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          currentUser.email,
          LogStatusEnum.SUCCESS,
          LogActionEnum.UNBLOCK,
          setMessage(
            getMessage(MessagesHelperKey.USER_UNBLOCKED_SUCCESS, 'pt-BR'),
            body.id,
          ),
        ),
        {
          identifierRequest,
          transaction: optionals?.transaction,
        },
      );

      this.logger.debug(`${identifierRequest} unblocked user ${body.id}`);

      return;
    } catch (error) {
      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          currentUser.email,
          LogStatusEnum.ERROR,
          LogActionEnum.UNBLOCK,
          setMessage(
            getMessage(MessagesHelperKey.USER_UNBLOCKED_ERROR, 'pt-BR'),
            body.id,
          ),
        ),
        {
          identifierRequest,
        },
      );

      handleError(error, languagePreference, {
        identifierRequest,
        message: getMessage(
          MessagesHelperKey.UNBLOCK_ERROR,
          languagePreference,
        ),
      });
    }
  }

  async updateUserPassword(
    body: UpdateUserPassword,
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<void> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    const functionName = 'updateUserPassword';

    this.logger.debug(`${identifierRequest} Update user password`);

    if (body.actualPassword === body.newPassword) {
      throw new BadRequestException(
        getMessage(MessagesHelperKey.PASSWORD_ARE_EQUALS, languagePreference),
      );
    }

    const user = await this.userRepository.findByIdAsync(
      currentUser.id,
      optionals?.transaction,
    );

    const execute = async (transaction: Prisma.TransactionClient) => {
      const isPasswordValid = await bcrypt.compare(
        body.actualPassword,
        user.password,
      );

      if (!isPasswordValid) {
        this.logger.debug(
          `${identifierRequest} Password validation is invalid`,
        );

        await this.logService.createAuditLog(
          new AuditLog(
            functionName,
            request.ip,
            request.url,
            MethodEnum[request.method],
            user.email,
            LogStatusEnum.ERROR,
            LogActionEnum.CHANGE_PERSONAL_INFORMATION,
            setMessage(
              getMessage(MessagesHelperKey.PASSWORD_CHANGED_ERROR, 'pt-BR'),
              user.email,
              'As senhas não conferem',
            ),
          ),
          {
            identifierRequest,
            transaction: transaction,
          },
        );

        throw new BadRequestException(
          getMessage(MessagesHelperKey.PASSWORD_UNMATCH, languagePreference),
        );
      }

      if (isDevelopmentEnviroment()) {
        this.logger.debug(
          `${identifierRequest} [DEV] User password : ${body.newPassword}`,
        );
      }

      const hash = await hashData(body.newPassword);
      this.logger.debug(`${identifierRequest} Password hashed`);

      await this.userRepository.validateVersion(currentUser.id, body.version);
      await this.userRepository.updateUserPassword(
        currentUser.id,
        hash,
        transaction,
      );

      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          user.email,
          LogStatusEnum.SUCCESS,
          LogActionEnum.CHANGE_PERSONAL_INFORMATION,
          setMessage(
            getMessage(MessagesHelperKey.PASSWORD_CHANGED, 'pt-BR'),
            user.email,
          ),
        ),
        {
          identifierRequest,
          transaction: transaction,
        },
      );

      this.logger.debug(`${identifierRequest} User password updated`);
    };

    try {
      guardUser(
        {
          blocked: user?.blocked,
          deletedAt: user?.deletedAt,
          email: user?.email,
          status: user?.status,
        },
        this.logger,
        languagePreference,
        {
          identifierRequest,
        },
      );

      if (optionals?.transaction) {
        this.logger.debug(`${identifierRequest} Executing in transaction`);

        await execute(optionals?.transaction);
      } else {
        this.logger.debug(
          `${identifierRequest} Transaction doesn't exists, creating a new transaction`,
        );

        await this.prisma.$transaction(async newTransaction => {
          await execute(newTransaction);
        });
      }
    } catch (error) {
      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          user.email,
          LogStatusEnum.ERROR,
          LogActionEnum.CHANGE_PERSONAL_INFORMATION,
          setMessage(
            getMessage(MessagesHelperKey.PASSWORD_CHANGED_ERROR, 'pt-BR'),
            user.email,
          ),
        ),
        {
          identifierRequest,
        },
      );
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async updateUserPersonalData(
    body: UpdateUserPersonalData,
    currentUser: UserPayload,
    request: AuditLogRequestInformation,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ) {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    const functionName = 'updateUserPersonalData';

    this.logger.debug(`${identifierRequest} Update user personal data`);

    if (!body?.name && !body?.mediaUrl) {
      this.logger.debug(
        `${identifierRequest} No data to update, returning without changes`,
      );

      return;
    }

    const user = await this.userRepository.findByIdAsync(
      currentUser?.id,
      optionals?.transaction,
    );

    guardUser(
      {
        blocked: user?.blocked,
        deletedAt: user?.deletedAt,
        email: user?.email,
        status: user?.status,
      },
      this.logger,
      languagePreference,
      {
        identifierRequest,
      },
    );

    const execute = async (transaction: Prisma.TransactionClient) => {
      const userUpdateInput: Prisma.UserUpdateInput = {
        version: body.version,
      };

      if (body.name) userUpdateInput.name = body.name;

      if (body.mediaUrl) {
        this.logger.debug(`${identifierRequest} Has mediaUrl`);

        userUpdateInput.Media = {
          upsert: {
            where: {
              id: user.mediaId || undefined,
            },
            create: {
              url: body.mediaUrl,
            },
            update: {
              url: body.mediaUrl,
            },
          },
        };
      }

      await this.userRepository.updateAsync(
        user.id,
        userUpdateInput,
        transaction,
      );

      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          user.email,
          LogStatusEnum.SUCCESS,
          LogActionEnum.CHANGE_PERSONAL_INFORMATION,
          setMessage(
            getMessage(MessagesHelperKey.PERSONAL_INFORMATION_UPDATED, 'pt-BR'),
            user.email,
          ),
        ),
        {
          identifierRequest,
          transaction: transaction,
        },
      );

      this.logger.debug(`${identifierRequest} User personal data updated`);
    };

    try {
      guardUser(
        {
          blocked: user?.blocked,
          deletedAt: user?.deletedAt,
          email: user?.email,
          status: user?.status,
        },
        this.logger,
        languagePreference,
        {
          identifierRequest,
        },
      );

      if (optionals?.transaction) {
        this.logger.debug(`${identifierRequest} Executing in transaction`);

        await execute(optionals?.transaction);
      } else {
        this.logger.debug(
          `${identifierRequest} Transaction doesn't exists, creating a new transaction`,
        );

        await this.prisma.$transaction(async newTransaction => {
          await execute(newTransaction);
        });
      }
    } catch (error) {
      await this.logService.createAuditLog(
        new AuditLog(
          functionName,
          request.ip,
          request.url,
          MethodEnum[request.method],
          user.email,
          LogStatusEnum.ERROR,
          LogActionEnum.CHANGE_PERSONAL_INFORMATION,
          setMessage(
            getMessage(
              MessagesHelperKey.PERSONAL_INFORMATION_UPDATED_ERROR,
              'pt-BR',
            ),
            user.email,
          ),
        ),
        {
          identifierRequest,
        },
      );
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async getRolesForFilter(
    moduleName: string,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<RoleForFilterDto[]> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.debug(`${identifierRequest} Get in roles for filter`);

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

      const rolesWithAccessToModule = getRolesWithAccessToModule(
        moduleName as ModuleEnum,
      );

      if (rolesWithAccessToModule.length === 0) {
        throw new NotFoundException(
          getMessage(MessagesHelperKey.ROLE_NOT_FOUND, languagePreference),
        );
      }

      const roles: RoleForFilterDto[] = rolesWithAccessToModule.map(role => ({
        name: role,
      }));

      return roles;
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  getFilterQueryFromSelectedModule(
    currentModule: ModuleEnum,
    filterSearch?: string,
  ) {
    const baseFilter: Record<string, any>[] = [
      {
        deletedAt: null,
      },
    ];

    if (!filterSearch) {
      return baseFilter;
    }

    const filter = filterSearch.trim();

    if (currentModule === ModuleEnum.ADMIN) {
      return this.getModuleAdminFilterQuery(baseFilter, filter);
    }

    this.logger.error(`Filter query from module ${module} is not setted`);
    throw new InternalServerErrorException(MessagesHelperKey.GENERIC_ERROR);
  }

  getModuleAdminFilterQuery(filter: Record<string, any>[], search: string) {
    if (RoleEnum[search.toUpperCase()] != null) {
      filter.push({
        Role: {
          name: RoleEnum[search.toUpperCase() as keyof typeof RoleEnum],
        },
      });

      return filter;
    }

    filter.push({
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    });

    return filter;
  }

  /**
   * Generates a select query object based on the selected module.
   * @param currentModule - The currently selected module.
   * @returns Select query object specific to the selected module, or undefined if the module is not supported.
   */
  getSelectQueryFromSelectedModule(currentModule: ModuleEnum) {
    if (currentModule === ModuleEnum.ADMIN) {
      return this.getModuleAdminSelectQuery();
    }

    this.logger.error(`Select query from module ${module} is not setted`);
    throw new InternalServerErrorException(MessagesHelperKey.GENERIC_ERROR);
  }

  /**
   * Generates a select query object for retrieving module admin users.
   * @returns Select query object for retrieving module admin users.
   */
  getModuleAdminSelectQuery() {
    return {
      ...BaseEntitySelect,
      email: true,
      blocked: true,
      name: true,
      status: true,
      Role: {
        select: {
          name: true,
        },
      },
    };
  }

  /**
   * Generates user data for creating a new user based on the specified module.
   * @param module - The module for which the user is being created.
   * @param registerDto - The data for user registration.
   * @param additionalData - Additional data required for creating the user.
   * @returns User data for creating a new user based on the module.
   */
  getCreateUserDataByModule(
    module: ModuleEnum,
    registerDto: UserCreateDto,
    additionalData?: {
      creatingAdminUser?: boolean;
      passwordHash?: string;
    },
  ): UserTypeMap[CrudType.CREATE] {
    if (module === ModuleEnum.ADMIN) {
      return this.getModuleAdminCreateUserData(registerDto, {
        creatingAdminUser: additionalData?.creatingAdminUser,
        hash: additionalData?.passwordHash,
      });
    }

    this.logger.error(`Creating user from module ${module} is not setted`);
    throw new InternalServerErrorException(MessagesHelperKey.GENERIC_ERROR);
  }

  /**
   * Generates user data for creating a new module admin user.
   * @param registerDto - The data for user registration.
   * @param additionalData - Additional data required for creating admin user.
   * @returns User data for creating a new module admin user.
   * @throws InternalServerErrorException if required data is missing.
   */
  getModuleAdminCreateUserData(
    registerDto: UserCreateDto,
    additionalData: {
      creatingAdminUser: boolean;
      hash: string;
    },
  ): UserTypeMap[CrudType.CREATE] {
    if (
      additionalData?.creatingAdminUser == null ||
      additionalData?.hash == null
    ) {
      this.logger.error('Creating user from module admin is missing data');
      throw new InternalServerErrorException(MessagesHelperKey.GENERIC_ERROR);
    }

    const { hash, creatingAdminUser } = additionalData;

    const data: UserTypeMap[CrudType.CREATE] = {
      email: registerDto.email,
      name: registerDto.name,
      password: hash,
      status: StatusEnum.ACTIVE,
      loginAttempts: 0,
      Role: {
        connect: {
          id: registerDto.roleId,
        },
      },
      ...(registerDto.image && {
        Media: {
          create: {
            url: registerDto.image,
          },
        },
      }),
    };

    data.UserAssignment = {
      create: registerDto.assignments.map(assignment => ({
        create: assignment.create,
        read: assignment.read,
        update: assignment.update,
        delete: assignment.delete,
        Assignment: {
          connect: {
            id: assignment.assignmentId,
          },
        },
      })),
    };

    return data;
  }

  /**
   * Generate a token to be used in the email confirmation.
   * @param email
   * @param id
   * @param languagePreference
   * @param optionals
   * @returns
   */
  async encodeEmailToken(
    email: string,
    id: string,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
    },
  ): Promise<string> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.debug(`${identifierRequest} Encode email token`);

      const payload = {
        sub: email,
        id: id,
      };

      return await this.jwtService.signAsync(payload, {
        secret: process.env.TK_EMAIL_SECRET,
        expiresIn: process.env.TK_EMAIL_LIFETIME,
      });
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  /**
   * Maps an entity from one class to another asynchronously using a mapper.
   * @template TInput - The input entity class type.
   * @template TOutput - The output entity class type.
   * @param {TInput} user - The input entity object to be mapped.
   * @param {new () => TInput} inputClass - The class constructor for the input entity.
   * @returns {TOutput} - A promise that resolves to the mapped output entity.
   */

  mapperEntity<TInput, TOutput>(
    user: TInput | TInput[],
    inputClass: new () => TInput,
    outputClass: new () => TOutput,
    mapperArray: boolean,
  ): TOutput | TOutput[] {
    if (mapperArray) {
      return this.mapper.mapArray(user as TInput[], inputClass, outputClass);
    }

    return this.mapper.map(user as TInput, inputClass, outputClass);
  }

  /**
   * Build a stringified JSON object with the user data before the update.
   * @param userPreUpdate
   * @returns Returns a stringified JSON object with the user data before the update.
   */
  getUserPreUpdateToAuditLogs(userPreUpdate: UserEntity) {
    const data = {
      id: userPreUpdate?.id,
      name: userPreUpdate.name,
      email: userPreUpdate.email,
      UserAssignment: userPreUpdate?.UserAssignment?.map(userAssignment => {
        return {
          id: userAssignment?.id,
          name: userAssignment?.Assignment?.name,
          create: userAssignment?.create,
          read: userAssignment?.read,
          update: userAssignment?.update,
          delete: userAssignment?.delete,
        };
      }),
      Role: {
        id: userPreUpdate?.Role,
        name: userPreUpdate?.Role?.name,
      },
      status: userPreUpdate?.status,
      version: userPreUpdate?.version,
    };

    return JSON.stringify(data);
  }

  /**
   * Uploads the user's avatar to the S3 bucket.
   * @param file - The file to be uploaded.
   * @param currentUser - The current user.
   * @param languagePreference - The language preference for the response.
   * @param version - The user's version.
   */

  async uploadAvatar(
    id: string,
    file: Express.Multer.File,
    currentUser: UserPayload,
    languagePreference: Languages,
    version: number,
  ) {
    const identifierRequest = randomUUID();
    this.logger.debug(`${identifierRequest} Upload avatar`);

    const user = await this.userRepository.findByIdAsync(id);

    if (!user) {
      this.logger.debug(`${identifierRequest} User not found`);
      throw new NotFoundException(
        setMessage(
          getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
          currentUser.id,
        ),
      );
    }

    if (currentUser.role === RoleEnum.ADMIN && currentUser.id !== id) {
      this.logger.debug(
        `${identifierRequest} User is not the same as the current user`,
      );
      throw new ForbiddenException(
        setMessage(
          getMessage(MessagesHelperKey.USER_ID_MISMATCH, languagePreference),
          currentUser.id,
        ),
      );
    }

    if (currentUser.role !== RoleEnum.ADMIN && currentUser.id !== id) {
      this.logger.debug(`${identifierRequest} User not found`);
      throw new NotFoundException(
        setMessage(
          getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
          currentUser.id,
        ),
      );
    }

    if (user.clientId !== currentUser.clientId) {
      this.logger.debug(`${identifierRequest} User not found`);
      throw new NotFoundException(
        setMessage(
          getMessage(MessagesHelperKey.USER_NOT_FOUND, languagePreference),
          currentUser.id,
        ),
      );
    }

    try {
      guardUser(
        {
          blocked: user?.blocked,
          deletedAt: user?.deletedAt,
          email: user?.email,
          status: user?.status,
        },
        this.logger,
        languagePreference,
        {
          identifierRequest,
        },
      );

      const results = await this.bucketS3Service.uploadFileToS3(
        file,
        process.env.AWS_PUBLIC_BUCKET_NAME,
        'avatars/',
      );

      const userUpdateInput: Prisma.UserUpdateInput = {
        version: version,
        Media: {
          create: {
            url: results.Location,
          },
        },
      };

      await this.userRepository.updateAsync(currentUser.id, userUpdateInput);
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }
}
