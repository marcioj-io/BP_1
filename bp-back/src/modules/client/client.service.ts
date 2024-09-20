import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AssignmentsEnum, Prisma, RoleEnum, StatusEnum } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AuthService } from 'src/auth/auth.service';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import {
  MessagesHelperKey,
  getMessage,
  setMessage,
} from 'src/helpers/messages.helper';
import { AuditLogRequestInformation } from 'src/middlewares/interface/logger';
import { Languages } from 'src/utils/language-preference';
import { hasOptionalMapper } from 'src/utils/optional';
import { handleError } from 'src/utils/treat.exceptions';

import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { ClientRepository } from './client.repository';
import { ActionEnum } from './dto/request/client.alter-status.dto';
import { ClientCreateDto } from './dto/request/client.create.dto';
import { ClientUpdateDto } from './dto/request/client.update.dto';
import { ClientPaginationResponse } from './dto/response/client.pagination.response';
import { ClientEntity } from './entity/client.entity';
import { ClientTypeMap } from './entity/client.type.map';

@Injectable()
export class ClientService {
  private logger = new Logger(ClientService.name);

  constructor(
    protected readonly clientRepository: ClientRepository,
    private readonly prisma: PrismaService,
    protected readonly authService: AuthService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createAsync(
    data: ClientCreateDto,
    request: AuditLogRequestInformation,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Partial<ClientEntity>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.log(`${identifierRequest} Create client`);

    const executeCreate = async (transaction: Prisma.TransactionClient) => {
      const alreadyExists = await this.clientRepository.exists({
        cnpj: data.cnpj,
      });

      if (alreadyExists) {
        this.logger.debug(`${identifierRequest} Client already exists`);
        throw new ConflictException(
          getMessage(
            MessagesHelperKey.CLIENT_ALREADY_EXISTS,
            languagePreference,
          ),
        );
      }

      const notFoundPackageIds: string[] = [];
      for (const id of data.packages) {
        const packages = await this.prisma.package.findUnique({
          where: { id },
        });
        if (!packages) {
          notFoundPackageIds.push(id);
        }
      }
      if (notFoundPackageIds.length > 0) {
        const message = `Packages with id's ${notFoundPackageIds.join(', ')} not found`;
        this.logger.debug(message);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.PACKAGE_NOT_FOUND, languagePreference),
            notFoundPackageIds.join(', '),
            message,
          ),
        );
      }

      const { user, ...rest } = data;

      const dataCreate: ClientTypeMap[CrudType.CREATE] = {
        ...rest,
        primaryAddress: {
          create: data.primaryAddress,
        },
        billingAddress: {
          create: data.billingAddress,
        },
        observations: {
          create: data.observations,
        },
        packages: {
          connect: data.packages.map(id => ({ id })),
        },
      };

      const createdClient = await this.clientRepository.createAsync(
        dataCreate,
        transaction,
      );

      const assigmentsResults = await transaction.assignment.findMany({
        where: {
          name: {
            in: [
              AssignmentsEnum.CLIENT,
              AssignmentsEnum.CLIENT_HISTORY,
              AssignmentsEnum.SOURCE,
              AssignmentsEnum.PACKAGE,
              AssignmentsEnum.COST_CENTER,
              AssignmentsEnum.EVENT,
            ],
          },
        },
      });

      //TODO: Change assigments to owner user
      const allAssigments = assigmentsResults.map(item => ({
        assignmentId: item.id,
        create: true,
        read: true,
        update: true,
        delete: true,
      }));

      const findRoleId = await transaction.role.findFirst({
        where: { name: RoleEnum.USER },
      });

      const costCenterName = 'Centro de custo - Administrador';

      let costCenter = await transaction.costCenter.findFirst({
        where: { name: costCenterName },
      });

      if (!costCenter) {
        costCenter = await this.prisma.costCenter.create({
          data: {
            name: costCenterName,
            description: 'Centro de custo padrão para administradores',
          },
        });
      }

      const userData = {
        name: data.user.name,
        email: data.user.email,
        costCenters: [costCenter.id],
        ownsClient: true,
        roleId: findRoleId.id,
        clientId: createdClient.id,
        assignments: allAssigments,
      };

      await this.authService.register(
        userData,
        currentUser,
        request,
        languagePreference,
        RoleEnum.ADMIN,
        transaction,
      );

      return createdClient;
    };

    try {
      if (optionals?.transaction) {
        this.logger.debug(`${identifierRequest} Executing in transaction`);

        return await executeCreate(optionals?.transaction);
      } else {
        this.logger.debug(
          `${identifierRequest} Transaction doesn't exists, creating a new transaction`,
        );

        return this.prisma.$transaction(async newTransaction => {
          return await executeCreate(newTransaction);
        });
      }
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async updateAsync(
    id: string,
    data: ClientUpdateDto,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<ClientEntity> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.log(`${identifierRequest} Update client`);

    const executeUpdate = async (transaction: Prisma.TransactionClient) => {
      if (id === null || id.trim() === '') {
        this.logger.debug(`${identifierRequest} Id is required`);
        throw new BadRequestException(
          getMessage(MessagesHelperKey.ID_REQUIRED, languagePreference),
        );
      }

      if (
        (await this.exists({ id }, currentUser, languagePreference, {
          transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} client not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const clientUpdateInput: ClientTypeMap[CrudType.UPDATE] = {
        ...data,
        primaryAddress: {
          update: data.primaryAddress,
        },
        billingAddress: {
          update: data.billingAddress,
        },
        observations: {
          create: data.observations.map(observation => ({
            observation: observation.observation,
          })),
        },
        packages: {
          set: data.packages.map(packageId => ({ id: packageId })),
        },
        version: data.version,
      };

      return await this.clientRepository.updateAsync(
        id,
        clientUpdateInput,
        transaction,
      );
    };

    try {
      if (optionals?.transaction) {
        this.logger.debug(`${identifierRequest} Executing in transaction`);

        return await executeUpdate(optionals?.transaction);
      } else {
        this.logger.debug(
          `${identifierRequest} Executing outside a transaction`,
        );

        return this.prisma.$transaction(async newTransaction => {
          return await executeUpdate(newTransaction);
        });
      }
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async deleteAsync(
    id: string,
    version: number,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<void> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.log(`${identifierRequest} Delete client`);

    if (id === null || id.trim() === '') {
      this.logger.debug(`${identifierRequest} Id is required`);
      throw new BadRequestException(
        getMessage(MessagesHelperKey.ID_REQUIRED, languagePreference),
      );
    }

    if (version == null) {
      this.logger.debug(`${identifierRequest} Version is required`);
      throw new BadRequestException(
        getMessage(MessagesHelperKey.VERSION_REQUIRED, languagePreference),
      );
    }

    const executeDelete = async (transaction: Prisma.TransactionClient) => {
      if (
        (await this.exists({ id }, currentUser, languagePreference, {
          transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} Client not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      await this.clientRepository.deleteAsync(id, version, transaction);
    };

    try {
      if (optionals?.transaction) {
        this.logger.debug(`${identifierRequest} Executing in transaction`);

        await executeDelete(optionals?.transaction);
      } else {
        this.logger.debug(
          `${identifierRequest} Executing outside a transaction`,
        );

        await this.prisma.$transaction(async newTransaction => {
          await executeDelete(newTransaction);
        });
      }
    } catch (error) {
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
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<ClientEntity | T> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find by id`);

      if (id === null || id.trim() === '') {
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
        this.logger.debug(`${identifierRequest} Client not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.clientRepository.findByIdAsync(
        id,
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

  async exists(
    where: ClientTypeMap[CrudType.WHERE],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<boolean> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Exists`);

      return await this.clientRepository.exists(where, optionals?.transaction);
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async findBy<S, T>(
    where: ClientTypeMap[CrudType.WHERE],
    select: ClientTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: ClientTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<ClientEntity | T> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} Client not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.clientRepository.findBy(
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
    where: ClientTypeMap[CrudType.WHERE],
    select: ClientTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: ClientTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<Partial<ClientEntity>[] | T[]> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find all by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} Client not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.clientRepository.findAllBy(
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
    filter: DefaultFilter<ClientTypeMap>,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Paginated<Partial<ClientPaginationResponse>>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find filtered async`);

      return await this.clientRepository.findFilteredAsync(
        filter,
        currentUser,
        optionals?.transaction,
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }
  async alterStatusAsync(
    action: ActionEnum,
    id: string,
    version: number,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<void> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} alter status`);
      if (currentUser.id === id) {
        this.logger.debug(
          `${identifierRequest} You can't change your own status`,
        );
        throw new ForbiddenException(
          getMessage(
            MessagesHelperKey.CHANGE_YOUR_OWN_STATUS,
            languagePreference,
          ),
        );
      }

      if (!Object.values(ActionEnum).includes(action)) {
        this.logger.debug(
          `${identifierRequest} Invalid action ${action} for alter status`,
        );
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const status: StatusEnum =
        action === ActionEnum.ACTIVATE
          ? StatusEnum.ACTIVE
          : StatusEnum.INACTIVE;

      await this.clientRepository.updateAsync(
        id,
        {
          status,
          version,
          users: {
            updateMany: {
              where: {},
              data: { status },
            },
          },
        },
        optionals?.transaction,
      );
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
}
