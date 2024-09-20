import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  HttpException,
  UnprocessableEntityException,
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

import { IBaseService } from '../base/interfaces/IBaseService';
import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { CostCenterRepository } from './cost-center.repository';
import { CostCenterCreateDto } from './dto/request/cost-center.create.dto';
import { DefaultFilterCostCenter } from './dto/request/cost-center.filter.dto';
import { CostCenterUpdateDto } from './dto/request/cost-center.update.dto';
import { CostCenterPaginationResponse } from './dto/response/cost-center.pagination.response';
import { CostCenterEntity } from './entity/cost-center.entity';
import { CostCenterTypeMap } from './entity/cost-center.type.map';

@Injectable()
export class CostCenterService {
  private logger = new Logger(CostCenterService.name);

  constructor(
    protected readonly costCenterRepository: CostCenterRepository,
    private readonly prisma: PrismaService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createAsync(
    clientId: string,
    data: CostCenterCreateDto,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Partial<CostCenterEntity>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.log(`${identifierRequest} Create costCenter`);

    const isClientExists = await this.prisma.client.findFirst({
      where: {
        id: clientId,
      },
    });

    if (!isClientExists) {
      this.logger.debug(`${identifierRequest} ClientId is required`);
      throw new NotFoundException(
        getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
      );
    }

    const executeCreate = async (transaction: Prisma.TransactionClient) => {
      const dataCreate: CostCenterTypeMap[CrudType.CREATE_UNCHECKED] = {
        ...data,
        clientId,
      };

      return await this.costCenterRepository.createAsync(
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

  async updateAsync(
    clientId: string,
    id: string,
    data: CostCenterUpdateDto,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<CostCenterEntity> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    this.logger.log(`${identifierRequest} Update costCenter`);

    const executeUpdate = async (transaction: Prisma.TransactionClient) => {
      const isClientExists = await this.prisma.client.findFirst({
        where: {
          id: clientId,
        },
      });

      if (!isClientExists) {
        this.logger.debug(`${identifierRequest} ClientId is required`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
        );
      }

      if (id === null || id.trim() === '') {
        this.logger.debug(`${identifierRequest} Id is required`);
        throw new BadRequestException(
          getMessage(MessagesHelperKey.ID_REQUIRED, languagePreference),
        );
      }
      const isCostCenterInClient = await this.prisma.costCenter.findFirst({
        where: {
          id,
          clientId,
        },
      });
      if (
        (await this.exists({ id }, currentUser, languagePreference, {
          transaction,
        })) === false ||
        !isCostCenterInClient
      ) {
        this.logger.debug(`${identifierRequest} costCenter not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      if (data.status === 'INACTIVE') {
        const linkedUsers = await this.prisma.userCostCenter.findMany({
          where: {
            costCenterId: id,
          },
        });

        if (linkedUsers.length > 0) {
          this.logger.debug(`${identifierRequest} CostCenter has linked users`);
          throw new UnprocessableEntityException(
            getMessage(MessagesHelperKey.LINKED_USERS, languagePreference),
          );
        }
      }

      const costCenterUpdateInput: CostCenterTypeMap[CrudType.UPDATE] = {
        ...data,
        version: data.version,
      };

      return await this.costCenterRepository.updateAsync(
        id,
        costCenterUpdateInput,
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
    clientId: string,
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
    this.logger.log(`${identifierRequest} Delete costCenter`);
    const isClientExists = await this.prisma.client.findUnique({
      where: {
        id: clientId,
      },
    });

    if (!isClientExists) {
      this.logger.debug(`${identifierRequest} ClientId is required`);
      throw new NotFoundException(
        getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
      );
    }

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

    // Verifica se há usuários vinculados a este centro de custo
    const linkedUsers = await this.prisma.userCostCenter.findMany({
      where: {
        costCenterId: id,
      },
    });

    // Se houver usuários vinculados, lança uma exceção
    if (linkedUsers.length > 0) {
      this.logger.debug(`${identifierRequest} CostCenter has linked users`);
      throw new UnprocessableEntityException(
        getMessage(MessagesHelperKey.LINKED_USERS, languagePreference),
      );
    }

    const executeDelete = async (transaction: Prisma.TransactionClient) => {
      if (
        (await this.exists({ id }, currentUser, languagePreference, {
          transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} CostCenter not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      await this.costCenterRepository.deleteAsync(id, version, transaction);
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
    clientId: string,
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
  ): Promise<CostCenterEntity | T> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find by id`);
      const isClientExists = await this.prisma.client.findFirst({
        where: {
          id: clientId,
        },
      });

      if (!isClientExists) {
        this.logger.debug(`${identifierRequest} ClientId is required`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
        );
      }

      if (id === null || id.trim() === '') {
        this.logger.debug(`${identifierRequest} Id is required`);
        throw new BadRequestException(
          getMessage(MessagesHelperKey.ID_REQUIRED, languagePreference),
        );
      }

      const isCostCenterInClient = await this.prisma.costCenter.findFirst({
        where: {
          id,
          clientId,
        },
      });
      if (
        (await this.exists({ id }, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false ||
        !isCostCenterInClient
      ) {
        this.logger.debug(`${identifierRequest} CostCenter not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.costCenterRepository.findByIdAsync(
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
    where: CostCenterTypeMap[CrudType.WHERE],
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

      return await this.costCenterRepository.exists(
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
    where: CostCenterTypeMap[CrudType.WHERE],
    select: CostCenterTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: CostCenterTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<CostCenterEntity | T> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} CostCenter not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.costCenterRepository.findBy(
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
    where: CostCenterTypeMap[CrudType.WHERE],
    select: CostCenterTypeMap[CrudType.SELECT],
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      orderBy?: CostCenterTypeMap[CrudType.ORDER_BY];
      transaction?: Prisma.TransactionClient;
      identifierRequest?: string;
      mapper?: {
        sourceClass: new () => S;
        destinationClass: new () => T;
      };
    },
  ): Promise<Partial<CostCenterEntity>[] | T[]> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find all by`);

      if (
        (await this.exists(where, currentUser, languagePreference, {
          transaction: optionals?.transaction,
        })) === false
      ) {
        this.logger.debug(`${identifierRequest} CostCenter not found`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.NOT_FOUND, languagePreference),
        );
      }

      const data = await this.costCenterRepository.findAllBy(
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
    clientId: string,
    filter: DefaultFilterCostCenter,
    currentUser: UserPayload,
    languagePreference: Languages,
    optionals?: {
      identifierRequest?: string;
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Paginated<Partial<CostCenterPaginationResponse>>> {
    const identifierRequest = optionals?.identifierRequest || randomUUID();
    try {
      this.logger.log(`${identifierRequest} Find filtered async`);
      const isClientExists = await this.prisma.client.findFirst({
        where: {
          id: clientId,
        },
      });

      if (!isClientExists) {
        this.logger.debug(`${identifierRequest} ClientId is required`);
        throw new NotFoundException(
          getMessage(MessagesHelperKey.CLIENT_NOT_FOUND, languagePreference),
        );
      }

      const user = await this.prisma.user.findFirstOrThrow({
        where: { id: currentUser.id },
      });

      if (currentUser.role === 'USER' && user.ownsClient) {
        return await this.costCenterRepository.findFilteredAsync(
          { ...filter, clientId },
          currentUser,
          optionals?.transaction,
        );
      } else if (currentUser.role === 'ADMIN') {
        return await this.costCenterRepository.findFilteredAsync(
          { ...filter },
          currentUser,
          optionals?.transaction,
        );
      } else {
        return await this.getCostCentersByUser(
          currentUser,
          { ...filter },
          optionals,
        );
      }
    } catch (error) {
      handleError(error, languagePreference, {
        identifierRequest,
      });
    }
  }

  async getCostCentersByUser(
    currentUser: UserPayload,
    filter: any,
    optionals?: {
      transaction?: Prisma.TransactionClient;
    },
  ): Promise<Paginated<Partial<CostCenterPaginationResponse>>> {
    try {
      const userCostCenters = await this.prisma.userCostCenter.findMany({
        where: { userId: currentUser.id },
      });

      const costCenterIds = userCostCenters.map(uc => uc.costCenterId);

      const costCenters = await this.costCenterRepository.findFilteredAsync(
        {
          ...filter,
          where: {
            ...filter.where,
            id: { in: costCenterIds },
          },
        },
        currentUser,
        optionals?.transaction,
      );

      return costCenters;
    } catch (error) {
      throw new NotFoundException(`User with ID ${currentUser.id} not found`);
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
