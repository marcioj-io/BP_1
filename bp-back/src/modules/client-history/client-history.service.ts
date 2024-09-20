import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, RoleEnum } from '@prisma/client';
import { randomUUID } from 'crypto';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import {
  MessagesHelperKey,
  getMessage,
  setMessage,
} from 'src/helpers/messages.helper';
import { Languages } from 'src/utils/language-preference';
import { hasOptionalMapper } from 'src/utils/optional';
import { handleError } from 'src/utils/treat.exceptions';

import { IBaseService } from '../base/interfaces/IBaseService';
import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { ClientHistoryRepository } from './client-history.repository';
import { ClientHistoryCreateDto } from './dto/request/client-history.create.dto';
import { DefaultFilterHistory } from './dto/request/client-history.filter.dto';
import { ClientHistoryUpdateDto } from './dto/request/client-history.update.dto';
import { ClientHistoryPaginationResponse } from './dto/response/client-history.pagination.response';
import { ClientHistoryEntity } from './entity/client-history.entity';
import { ClientHistoryTypeMap } from './entity/client-history.type.map';

@Injectable()
export class ClientHistoryService {
  private logger = new Logger(ClientHistoryService.name);

  constructor(
    protected readonly clientHistoryRepository: ClientHistoryRepository,
    private readonly prisma: PrismaService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createAsync(
    data: ClientHistoryCreateDto,
    clientId: string,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Partial<ClientHistoryEntity>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.log(`${identifierRequest} Create clientHistory`);

    const executeCreate = async (transaction: Prisma.TransactionClient) => {
      const client = await this.prisma.client.findFirst({
        where: {
          id: clientId,
        },
      });

      if (!client) {
        this.logger.debug(`${identifierRequest} Client not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
            currentUser.id,
          ),
        );
      }

      if (
        currentUser.role === RoleEnum.USER &&
        client.id !== currentUser.clientId
      ) {
        this.logger.debug(`${identifierRequest} Client not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
            currentUser.id,
          ),
        );
      }

      const dataCreate: ClientHistoryTypeMap[CrudType.CREATE] = {
        observation: data.observation,
        client: {
          connect: {
            id: clientId,
          },
        },
      };
      return await this.clientHistoryRepository.createAsync(
        dataCreate,
        transaction,
      );
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
    this.logger.log(`${identifierRequest} Delete clientHistory`);

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
        this.logger.debug(`${identifierRequest} ClientHistory not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      await this.clientHistoryRepository.deleteAsync(id, version, transaction);
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
    clientId: string,
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
  ): Promise<ClientHistoryEntity | T> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find by id`);
      const client = await this.prisma.client.findFirst({
        where: {
          id: clientId,
        },
      });

      if (!client) {
        this.logger.debug(`${identifierRequest} Client not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
            currentUser.id,
          ),
        );
      }

      if (
        currentUser.role !== RoleEnum.ADMIN &&
        client.id !== currentUser.clientId
      ) {
        this.logger.debug(`${identifierRequest} Client not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
            currentUser.id,
          ),
        );
      }

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
        this.logger.debug(`${identifierRequest} ClientHistory not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.clientHistoryRepository.findByIdAsync(
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
    where: ClientHistoryTypeMap[CrudType.WHERE],
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

      return await this.clientHistoryRepository.exists(
        where,
        optionals?.transaction,
      );
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async findBy<S, T>(
    where: ClientHistoryTypeMap[CrudType.WHERE],
    select: ClientHistoryTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: ClientHistoryTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<ClientHistoryEntity | T> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} ClientHistory not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.clientHistoryRepository.findBy(
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
    where: ClientHistoryTypeMap[CrudType.WHERE],
    select: ClientHistoryTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: ClientHistoryTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<Partial<ClientHistoryEntity>[] | T[]> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find all by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} ClientHistory not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.clientHistoryRepository.findAllBy(
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
    filter: DefaultFilterHistory,
    clientId: string,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Paginated<Partial<ClientHistoryPaginationResponse>>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find filtered async`);
      const client = await this.prisma.client.findFirst({
        where: {
          id: clientId,
        },
      });

      if (!client) {
        this.logger.debug(`${identifierRequest} Client not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
            currentUser.id,
          ),
        );
      }

      if (
        currentUser.role !== RoleEnum.ADMIN &&
        client.id !== currentUser.clientId
      ) {
        this.logger.debug(`${identifierRequest} Client not found`);
        throw new NotFoundException(
          setMessage(
            getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
            currentUser.id,
          ),
        );
      }
      return await this.clientHistoryRepository.findFilteredAsync(
        { ...filter, clientId },
        currentUser,
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
