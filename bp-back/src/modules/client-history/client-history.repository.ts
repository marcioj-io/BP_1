import { Injectable } from '@nestjs/common';
import { Prisma, StatusEnum } from '@prisma/client';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Paginator } from 'src/utils/paginator';

import { BaseEntitySelect } from '../base/base.entity';
import { BaseRepository } from '../base/base.repository';
import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { DefaultFilterHistory } from './dto/request/client-history.filter.dto';
import { ClientHistoryEntity } from './entity/client-history.entity';
import { ClientHistoryTypeMap } from './entity/client-history.type.map';

@Injectable()
export class ClientHistoryRepository extends BaseRepository<ClientHistoryTypeMap> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findFilteredAsync(
    filter: DefaultFilterHistory,
    user?: UserPayload,
    transaction?: Prisma.TransactionClient,
  ): Promise<Paginated<Partial<ClientHistoryEntity>>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const AND: Record<string, any>[] = [];

    if (filter.search) {
      AND.push({
        OR: [{}],
      });
    }

    AND.push({
      clientId: filter.clientId,
    });

    // TODO-GENERATOR: Modify the select paginated of entity, if you want to select all entity, just remove the select from apply pagination
    const prismaSelect: ClientHistoryTypeMap[CrudType.SELECT] = {
      observation: true,
      clientId: true,
      ...BaseEntitySelect,
    };

    return await Paginator.applyPagination(prisma.clientHistory, {
      ...filter,
      where: { AND },
      select: prismaSelect,
    });
  }

  async updateAsync(
    id: string,
    data: ClientHistoryTypeMap[CrudType.UPDATE],
    transaction?: Prisma.TransactionClient,
  ): Promise<ClientHistoryEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    await this.validateVersion(id, Number(data.version), transaction);

    return await prisma.clientHistory.update({
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
    where: ClientHistoryTypeMap[CrudType.WHERE],
    select: ClientHistoryTypeMap[CrudType.SELECT],
    orderBy?: ClientHistoryTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const data = await prisma.clientHistory.findFirst({
      where,
      select,
      orderBy,
    });

    return data;
  }

  async findByIdAsync(
    id: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<ClientHistoryEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.clientHistory.findUnique({
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

    await prisma.clientHistory.update({
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
      | ClientHistoryTypeMap[CrudType.CREATE]
      | ClientHistoryTypeMap[CrudType.CREATE_UNCHECKED],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<ClientHistoryEntity>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.clientHistory.create({
      data,
    });
  }

  async findAllBy(
    where: ClientHistoryTypeMap[CrudType.WHERE],
    select: ClientHistoryTypeMap[CrudType.SELECT],
    orderBy?: ClientHistoryTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<ClientHistoryEntity[]>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.clientHistory.findMany({
      where,
      select,
      orderBy,
    });
  }

  async exists(
    where: ClientHistoryTypeMap[CrudType.WHERE],
    transaction?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const clientHistory = await prisma.clientHistory.count({
      where,
    });

    return clientHistory > 0;
  }
}
