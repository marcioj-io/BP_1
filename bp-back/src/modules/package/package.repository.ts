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
import { PackageEntity } from './entity/package.entity';
import { PackageTypeMap } from './entity/package.type.map';

@Injectable()
export class PackageRepository extends BaseRepository<PackageTypeMap> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findFilteredAsync(
    filter: DefaultFilter<PackageTypeMap>,
    user?: UserPayload,
    transaction?: Prisma.TransactionClient,
  ): Promise<Paginated<Partial<PackageEntity>>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const AND: Record<string, any>[] = [
      {
        status: StatusEnum.ACTIVE,
      },
    ];

    if (filter.search) {
      AND.push({
        OR: [
          {
            name: {
              contains: filter.search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    const prismaSelect: PackageTypeMap[CrudType.SELECT] = {
      name: true,
      deliveryForecastInDays: true,
      simpleForm: true,
      notes: true,
      clientId: true,
      PriceRange: true,
      Sources: true,
      ...BaseEntitySelect,
    };

    return await Paginator.applyPagination(prisma.package, {
      ...filter,
      where: { AND },
      select: prismaSelect,
    });
  }

  async updateAsync(
    id: string,
    data: PackageTypeMap[CrudType.UPDATE],
    transaction?: Prisma.TransactionClient,
  ): Promise<PackageEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    await this.validateVersion(id, Number(data.version), transaction);

    return await prisma.package.update({
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
    where: PackageTypeMap[CrudType.WHERE],
    select: PackageTypeMap[CrudType.SELECT],
    orderBy?: PackageTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const data = await prisma.package.findFirst({
      where,
      select,
      orderBy,
    });

    return data;
  }

  async findByIdAsync(
    id: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<PackageEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.package.findUnique({
      where: {
        id,
      },
      include: {
        PriceRange: {
          select: {
            id: true,
            version: true,
            amount: true,
            price: true,
          },
        },
        Sources: {
          select: {
            name: true,
            id: true,
          },
        },
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

    await prisma.package.update({
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
      | PackageTypeMap[CrudType.CREATE]
      | PackageTypeMap[CrudType.CREATE_UNCHECKED],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<PackageEntity>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.package.create({
      data,
    });
  }

  async findAllBy(
    where: PackageTypeMap[CrudType.WHERE],
    select: PackageTypeMap[CrudType.SELECT],
    orderBy?: PackageTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<PackageEntity[]>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.package.findMany({
      where,
      select,
      orderBy,
    });
  }

  async exists(
    where: PackageTypeMap[CrudType.WHERE],
    transaction?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const packageCount = await prisma.package.count({
      where,
    });

    return packageCount > 0;
  }
}
