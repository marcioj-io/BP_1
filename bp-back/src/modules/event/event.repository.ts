import { Injectable } from '@nestjs/common';
import { Prisma, StatusEnum } from '@prisma/client';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { Paginator } from 'src/utils/paginator';

import { BaseRepository } from '../base/base.repository';
import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { DefaultFilterEvent } from './dto/request/event.filtes.dto';
import { EventEntity } from './entity/event.entity';
import { EventTypeMap } from './entity/event.type.map';

@Injectable()
export class EventRepository extends BaseRepository<EventTypeMap> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findFilteredAsync(
    filter: DefaultFilterEvent,
    user?: UserPayload,
    transaction?: Prisma.TransactionClient,
  ): Promise<Paginated<Partial<EventEntity>>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const AND: Record<string, any>[] = [];

    if (filter.search) {
      const OR: Record<string, any>[] = [
        { User: { name: { contains: filter.search, mode: 'insensitive' } } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];

      if (filter.type) {
        OR.push({ type: { contains: filter.type, mode: 'insensitive' } });
      }

      if (filter.startDate && filter.endDate) {
        OR.push({ createdAt: { gte: filter.startDate, lte: filter.endDate } });
      }

      AND.push({ OR });
    }

    const { type, event, startDate, endDate } = filter || {};

    type && AND.push({ type });
    event && AND.push({ event });
    startDate && AND.push({ createdAt: { gte: startDate } });
    endDate && AND.push({ createdAt: { lte: endDate } });

    const prismaSelect: EventTypeMap[CrudType.SELECT] = {
      id: true,
      ip: true,
      User: {
        select: {
          name: true,
        },
      },
      event: true,
      additionalData: true,
      description: true,
      type: true,
      createdAt: true,
    };

    const { orderBy, ...filtersWithoutOrderBy } = filter;

    return await Paginator.applyPagination(prisma.event, {
      ...filtersWithoutOrderBy,
      where: { AND },
      select: prismaSelect,
      ...orderBy,
    });
  }

  async updateAsync(
    id: string,
    data: EventTypeMap[CrudType.UPDATE],
    transaction?: Prisma.TransactionClient,
  ): Promise<EventEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    await this.validateVersion(id, Number(data.version), transaction);

    return await prisma.event.update({
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
    where: EventTypeMap[CrudType.WHERE],
    select: EventTypeMap[CrudType.SELECT],
    orderBy?: EventTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const data = await prisma.event.findFirst({
      where,
      select,
      orderBy,
    });

    return data;
  }

  async findByIdAsync(
    id: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<EventEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.event.findUnique({
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

    await prisma.event.update({
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
      | EventTypeMap[CrudType.CREATE]
      | EventTypeMap[CrudType.CREATE_UNCHECKED],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<EventEntity>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.event.create({
      data,
    });
  }

  async findAllBy(
    where: EventTypeMap[CrudType.WHERE],
    select: EventTypeMap[CrudType.SELECT],
    orderBy?: EventTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<EventEntity[]>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.event.findMany({
      where,
      select,
      orderBy,
    });
  }

  async exists(
    where: EventTypeMap[CrudType.WHERE],
    transaction?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const event = await prisma.event.count({
      where,
    });

    return event > 0;
  }
}
