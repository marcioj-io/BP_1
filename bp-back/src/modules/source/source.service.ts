import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, StatusEnum } from '@prisma/client';
import { randomUUID } from 'crypto';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { MessagesHelperKey, getMessage } from 'src/helpers/messages.helper';
import { Languages } from 'src/utils/language-preference';
import { hasOptionalMapper } from 'src/utils/optional';
import { handleError } from 'src/utils/treat.exceptions';

import { IBaseService } from '../base/interfaces/IBaseService';
import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { ActionEnum } from '../client/dto/request/client.alter-status.dto';
import { SourceCreateDto } from './dto/request/source.create.dto';
import { SourceUpdateDto } from './dto/request/source.update.dto';
import { SourcePaginationResponse } from './dto/response/source.pagination.response';
import { SourceEntity } from './entity/source.entity';
import { SourceTypeMap } from './entity/source.type.map';
import { SourceRepository } from './source.repository';

@Injectable()
export class SourceService implements IBaseService<SourceTypeMap> {
  private logger = new Logger(SourceService.name);

  constructor(
    protected readonly sourceRepository: SourceRepository,
    private readonly prisma: PrismaService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createAsync(
    data: SourceCreateDto,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Partial<SourceEntity>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.log(`${identifierRequest} Create source`);

    const executeCreate = async (transaction: Prisma.TransactionClient) => {
      const dataCreate: SourceTypeMap[CrudType.CREATE_UNCHECKED] = {
        ...data,
      };
      return await this.sourceRepository.createAsync(dataCreate, transaction);
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
    data: SourceUpdateDto,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<SourceEntity> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.log(`${identifierRequest} Update source`);

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
        this.logger.debug(`${identifierRequest} source not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const sourceUpdateInput: SourceTypeMap[CrudType.UPDATE] = {
        ...data,
      };

      return await this.sourceRepository.updateAsync(
        id,
        sourceUpdateInput,
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
    this.logger.log(`${identifierRequest} Delete source`);

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
        this.logger.debug(`${identifierRequest} Source not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      await this.sourceRepository.deleteAsync(id, version, transaction);
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
  ): Promise<SourceEntity | T> {
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
        this.logger.debug(`${identifierRequest} Source not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.sourceRepository.findByIdAsync(
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
    where: SourceTypeMap[CrudType.WHERE],
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

      return await this.sourceRepository.exists(where, optionals?.transaction);
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async findBy<S, T>(
    where: SourceTypeMap[CrudType.WHERE],
    select: SourceTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: SourceTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<SourceEntity | T> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} Source not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.sourceRepository.findBy(
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
    where: SourceTypeMap[CrudType.WHERE],
    select: SourceTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: SourceTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<Partial<SourceEntity>[] | T[]> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find all by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} Source not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.sourceRepository.findAllBy(
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
    filter: DefaultFilter<SourceTypeMap>,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Paginated<Partial<SourcePaginationResponse>>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find filtered async`);

      return await this.sourceRepository.findFilteredAsync(
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

      if (!Object.values(ActionEnum).includes(action)) {
        this.logger.debug(
          `${identifierRequest} Invalid action ${action} for alter status`,
        );
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const status =
        action === ActionEnum.ACTIVATE
          ? StatusEnum.ACTIVE
          : StatusEnum.INACTIVE;

      await this.sourceRepository.updateAsync(
        id,
        {
          status,
          version,
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
