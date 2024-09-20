import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { MessagesHelperKey, getMessage } from 'src/helpers/messages.helper';
import { Languages } from 'src/utils/language-preference';
import { hasOptionalMapper } from 'src/utils/optional';
import { handleError } from 'src/utils/treat.exceptions';

import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { EventCreateDto } from './dto/request/event.create.dto';
import { DefaultFilterEvent } from './dto/request/event.filtes.dto';
import { EventPaginationResponse } from './dto/response/event.pagination.response';
import { EventEntity } from './entity/event.entity';
import { EventTypeMap } from './entity/event.type.map';
import { EventRepository } from './event.repository';

@Injectable()
export class EventService {
  private logger = new Logger(EventService.name);

  constructor(
    protected readonly eventRepository: EventRepository,
    private readonly prisma: PrismaService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createAsync(
    data: EventCreateDto,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Partial<EventEntity>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.log(`${identifierRequest} Create event`);

    const executeCreate = async (transaction: Prisma.TransactionClient) => {
      const { userId, ...rest } = data;
      const dataCreate: EventTypeMap[CrudType.CREATE] = {
        ...rest,
        User: {
          connect: {
            id: data.userId,
          },
        },
      };
      return await this.eventRepository.createAsync(dataCreate, transaction);
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
  ): Promise<EventEntity | T> {
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
        this.logger.debug(`${identifierRequest} Event not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.eventRepository.findByIdAsync(
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
    where: EventTypeMap[CrudType.WHERE],
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

      return await this.eventRepository.exists(where, optionals?.transaction);
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async findBy<S, T>(
    where: EventTypeMap[CrudType.WHERE],
    select: EventTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: EventTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<EventEntity | T> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} Event not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.eventRepository.findBy(
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
    where: EventTypeMap[CrudType.WHERE],
    select: EventTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: EventTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<Partial<EventEntity>[] | T[]> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find all by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} Event not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.eventRepository.findAllBy(
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
    filter: DefaultFilterEvent,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Paginated<Partial<EventPaginationResponse>>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find filtered async`);
      const events = await this.eventRepository.findFilteredAsync(
        filter,
        currentUser,
        optionals?.transaction,
      );

      const newEvents = events.data.map(event => {
        const { User, ...rest } = event;
        return {
          ...rest,
          userName: User.name,
        };
      });
      return { ...events, data: newEvents };
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
