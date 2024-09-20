import { Injectable } from '@nestjs/common';
import { Prisma, StatusEnum } from '@prisma/client';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { Paginator } from 'src/utils/paginator';

import { BaseEntitySelect } from '../base/base.entity';
import { BaseRepository } from '../base/base.repository';
import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { ClientEntity } from './entity/client.entity';
import { ClientTypeMap } from './entity/client.type.map';

@Injectable()
export class ClientRepository extends BaseRepository<ClientTypeMap> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findFilteredAsync(
    filter: DefaultFilter<ClientTypeMap>,
    user?: UserPayload,
    transaction?: Prisma.TransactionClient,
  ): Promise<Paginated<Partial<ClientEntity>>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const AND: Record<string, any>[] = [];

    if (filter.search) {
      AND.push({
        OR: [{}],
      });
    }

    // TODO-GENERATOR: Modify the select paginated of entity, if you want to select all entity, just remove the select from apply pagination
    const prismaSelect: ClientTypeMap[CrudType.SELECT] = {
      ...BaseEntitySelect,
    };

    return await Paginator.applyPagination(prisma.client, {
      ...filter,
      where: { AND },
      select: prismaSelect,
    });
  }

  async updateAsync(
    id: string,
    data: ClientTypeMap[CrudType.UPDATE],
    transaction?: Prisma.TransactionClient,
  ): Promise<ClientEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    await this.validateVersion(id, Number(data.version), transaction);

    return await prisma.client.update({
      where: {
        id,
        version: Number(data.version),
      },
      data: {
        ...data,
        version: {
          increment: 1,
        },
      },
    });
  }

  async findBy(
    where: ClientTypeMap[CrudType.WHERE],
    select: ClientTypeMap[CrudType.SELECT],
    orderBy?: ClientTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const data = await prisma.client.findFirst({
      where,
      select,
      orderBy,
    });

    return data;
  }

  async findByIdAsync(
    id: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<ClientEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.client.findUnique({
      where: {
        id,
      },
    });
  }

  async deleteAsync(
    id: string,
    version: number,
    transaction?: Prisma.TransactionClient,
  ): Promise<void> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    await this.validateVersion(id, Number(version), transaction);

    await prisma.client.update({
      where: {
        id,
      },
      data: {
        status: StatusEnum.INACTIVE,
        deletedAt: new Date(),
      },
    });
  }

  async createAsync(
    data:
      | ClientTypeMap[CrudType.CREATE]
      | ClientTypeMap[CrudType.CREATE_UNCHECKED],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<ClientEntity>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.client.create({
      data,
    });
  }

  async findAllBy(
    where: ClientTypeMap[CrudType.WHERE],
    select: ClientTypeMap[CrudType.SELECT],
    orderBy?: ClientTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<ClientEntity[]>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.client.findMany({
      where,
      select,
      orderBy,
    });
  }

  async exists(
    where: ClientTypeMap[CrudType.WHERE],
    transaction?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const client = await prisma.client.count({
      where,
    });

    return client > 0;
  }
}
