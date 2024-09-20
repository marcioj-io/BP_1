import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatusEnum } from '@prisma/client';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { Paginator } from 'src/utils/paginator';

import { BaseEntitySelect } from '../base/base.entity';
import { BaseRepository } from '../base/base.repository';
import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { DefaultFilterCostCenter } from './dto/request/cost-center.filter.dto';
import { CostCenterEntity } from './entity/cost-center.entity';
import { CostCenterTypeMap } from './entity/cost-center.type.map';

@Injectable()
export class CostCenterRepository extends BaseRepository<CostCenterTypeMap> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private clientCostCenterFilter(user?: UserPayload): Record<string, any>[] {
    const AND: Record<string, any>[] = [];

    if (user?.clientId) {
      AND.push({ clientId: user.clientId });
    }

    return AND;
  }

  async findFilteredAsync(
    filter: DefaultFilterCostCenter,
    user?: UserPayload,
    transaction?: Prisma.TransactionClient,
  ): Promise<Paginated<Partial<CostCenterEntity>>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const AND: Record<string, any>[] = [...this.clientCostCenterFilter(user)];

    if (filter.search) {
      AND.push({
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { description: { contains: filter.search, mode: 'insensitive' } },
        ],
      });
    }

    if (filter.status) {
      AND.push({
        OR: [{ status: filter.status }],
      });
    }

    if (filter.where?.id) {
      AND.push({
        id: filter.where.id,
      });
    }

    const prismaSelect: CostCenterTypeMap[CrudType.SELECT] = {
      name: true,
      description: true,
      ...BaseEntitySelect,
    };

    return await Paginator.applyPagination(prisma.costCenter, {
      ...filter,
      where: {
        AND,
        clientId: filter.clientId,
        deletedAt: {
          equals: null,
        },
      },
      select: prismaSelect,
    });
  }

  async updateAsync(
    id: string,
    data: CostCenterTypeMap[CrudType.UPDATE],
    transaction?: Prisma.TransactionClient,
  ): Promise<CostCenterEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    await this.validateVersion(id, Number(data.version), transaction);

    return await prisma.costCenter.update({
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
    where: CostCenterTypeMap[CrudType.WHERE],
    select: CostCenterTypeMap[CrudType.SELECT],
    orderBy?: CostCenterTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const data = await prisma.costCenter.findFirst({
      where,
      select,
      orderBy,
    });

    return data;
  }

  async findByIdAsync(
    id: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<CostCenterEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.costCenter.findUnique({
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

    await prisma.costCenter.update({
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
      | CostCenterTypeMap[CrudType.CREATE]
      | CostCenterTypeMap[CrudType.CREATE_UNCHECKED],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<CostCenterEntity>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.costCenter.create({
      data,
    });
  }

  async findAllBy(
    where: CostCenterTypeMap[CrudType.WHERE],
    select: CostCenterTypeMap[CrudType.SELECT],
    orderBy?: CostCenterTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<CostCenterEntity[]>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.costCenter.findMany({
      where,
      select,
      orderBy,
    });
  }

  async exists(
    where: CostCenterTypeMap[CrudType.WHERE],
    transaction?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const costCenter = await prisma.costCenter.count({
      where,
    });

    return costCenter > 0;
  }
}
