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
import { SourceEntity } from './entity/source.entity';
import { SourceTypeMap } from './entity/source.type.map';

@Injectable()
export class SourceRepository extends BaseRepository<SourceTypeMap> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findFilteredAsync(
    filter: DefaultFilter<SourceTypeMap>,
    user?: UserPayload,
    transaction?: Prisma.TransactionClient,
  ): Promise<Paginated<Partial<SourceEntity>>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const AND: Record<string, any>[] = [];

    if (filter.search) {
      AND.push({
        OR: [
          {
            name: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    // TODO-GENERATOR: Modify the select paginated of entity, if you want to select all entity, just remove the select from apply pagination
    const prismaSelect: SourceTypeMap[CrudType.SELECT] = {
      name: true,
      description: true,
      unitCost: true,
      validityInDays: true,
      application: true,
      ...BaseEntitySelect,
    };

    return await Paginator.applyPagination(prisma.source, {
      ...filter,
      where: { AND, deletedAt: { equals: null } },
      select: prismaSelect,
    });
  }

  async updateAsync(
    id: string,
    data: SourceTypeMap[CrudType.UPDATE],
    transaction?: Prisma.TransactionClient,
  ): Promise<SourceEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    await this.validateVersion(id, Number(data.version), transaction);

    return await prisma.source.update({
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
    where: SourceTypeMap[CrudType.WHERE],
    select: SourceTypeMap[CrudType.SELECT],
    orderBy?: SourceTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const data = await prisma.source.findFirst({
      where,
      select,
      orderBy,
    });

    return data;
  }

  async findByIdAsync(
    id: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<SourceEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.source.findUnique({
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

    await prisma.source.update({
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
      | SourceTypeMap[CrudType.CREATE]
      | SourceTypeMap[CrudType.CREATE_UNCHECKED],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<SourceEntity>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.source.create({
      data,
    });
  }

  async findAllBy(
    where: SourceTypeMap[CrudType.WHERE],
    select: SourceTypeMap[CrudType.SELECT],
    orderBy?: SourceTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<SourceEntity[]>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.source.findMany({
      where,
      select,
      orderBy,
    });
  }

  async exists(
    where: SourceTypeMap[CrudType.WHERE],
    transaction?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const source = await prisma.source.count({
      where,
    });

    return source > 0;
  }
}
