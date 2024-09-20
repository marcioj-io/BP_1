import { Injectable } from '@nestjs/common';
import { Prisma, RoleEnum, StatusEnum } from '@prisma/client';
import { User } from '@prisma/client';
import { UserPayload } from 'src/auth/models/UserPayload';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { DefaultFilter } from 'src/filters/DefaultFilter';
import { Paginator } from 'src/utils/paginator';

import { BaseRepository } from '../base/base.repository';
import { CrudType } from '../base/interfaces/ICrudTypeMap';
import { Paginated } from '../base/interfaces/IPaginated';
import { RoleDto } from './dto/response/assignments.dto';
import { TUserPagination } from './dto/type/user.pagination';
import { UserEntity } from './entity/user.entity';
import { UserTypeMap } from './entity/user.type.map';

@Injectable()
export class UserRepository extends BaseRepository<UserTypeMap> {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private clientCostCenterFilter(user?: UserPayload): Record<string, any>[] {
    const AND: Record<string, any>[] = [];

    if (user?.clientId) {
      AND.push({ clientId: user.clientId });
    }

    if (user?.costCenters) {
      AND.push({
        costCenters: {
          some: {
            costCenterId: user.costCenters,
          },
        },
      });
    }

    return AND;
  }

  async findFilteredAsync(
    filter: DefaultFilter<UserTypeMap>,
    user?: UserPayload,
    transaction?: Prisma.TransactionClient,
  ): Promise<Paginated<TUserPagination>> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const prismaSelect: UserTypeMap[CrudType.SELECT] = filter.select;

    const whereClause: Prisma.UserWhereInput = {
      AND: [
        ...filter.query,
        ...(filter.status ? [{ status: filter.status }] : []),
        ...(filter.search
          ? [{ name: { contains: filter.search, mode: 'insensitive' } }]
          : []),
        ...this.clientCostCenterFilter(user),
      ],
    };

    return await Paginator.applyPagination(prisma.user, {
      ...filter,
      where: whereClause,
      select: prismaSelect,
    });
  }

  async updateAsync(
    id: string,
    data: UserTypeMap[CrudType.UPDATE],
    transaction?: Prisma.TransactionClient,
  ): Promise<User> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    await this.validateVersion(id, Number(data?.version), transaction);

    return await prisma.user.update({
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

  async changeUserRestriction(
    userId: string,
    version: number,
    action: 'BLOCK' | 'UNBLOCK',
    transaction?: Prisma.TransactionClient,
  ): Promise<void> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    await this.validateVersion(userId, version, transaction);

    await prisma.user.updateMany({
      where: {
        id: userId,
      },
      data: {
        ...(action === 'BLOCK'
          ? { blocked: true, loginAttempts: -1 }
          : { blocked: false, loginAttempts: 0 }),
        version: {
          increment: 1,
        },
      },
    });
  }

  async findBy(
    where: UserTypeMap[CrudType.WHERE],
    select: UserTypeMap[CrudType.SELECT],
    orderBy?: UserTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.user.findFirst({
      where,
      select,
      orderBy,
    });
  }

  async findByIdAsync(
    id: string,
    transaction?: Prisma.TransactionClient,
  ): Promise<UserEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
        //TODO: alterar repositorio apenas para me
        // status: {
        //   not: StatusEnum.INACTIVE,
        // },
      },
      include: {
        UserAssignment: {
          where: {
            Assignment: {
              status: StatusEnum.ACTIVE,
              // deletedAt: null,
            },
          },
          include: {
            Assignment: true,
          },
        },
        Role: true,
        Media: true,
        costCenters: {
          include: {
            costCenter: true,
          },
        },
        sources: {
          include: {
            Source: {
              select: {
                id: true,
                name: true,
              },
            },
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

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        status: StatusEnum.INACTIVE,
        deletedAt: new Date(),
        version: {
          increment: 1,
        },
      },
    });
  }

  async createAsync(
    data: UserTypeMap[CrudType.CREATE],
    transaction?: Prisma.TransactionClient,
  ): Promise<UserEntity> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.user.create({
      data: {
        ...data,
        status: StatusEnum.PENDING,
        version: 1,
      },
      include: {
        client: true,
        costCenters: true,
        Role: true,
        UserAssignment: {
          where: {
            Assignment: {
              status: StatusEnum.ACTIVE,
              deletedAt: null,
            },
          },
          include: {
            Assignment: true,
          },
        },
      },
    });
  }

  async findAllBy(
    where: UserTypeMap[CrudType.WHERE],
    select: UserTypeMap[CrudType.SELECT],
    orderBy?: UserTypeMap[CrudType.ORDER_BY],
    transaction?: Prisma.TransactionClient,
  ): Promise<Partial<UserEntity>[]> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.user.findMany({
      where,
      select,
      orderBy,
    });
  }

  async exists(
    where: UserTypeMap[CrudType.WHERE],
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const user = await prisma.user.count({
      where,
    });

    return user > 0;
  }

  async findByEmail(email: string, transaction?: Prisma.TransactionClient) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const user = await prisma.user.findFirst({
      where: {
        email: email?.trim()?.toLowerCase(),
        deletedAt: null,
      },
      include: {
        UserAssignment: {
          where: {
            Assignment: {
              status: StatusEnum.ACTIVE,
              deletedAt: null,
            },
          },
          include: {
            Assignment: true,
          },
        },
        Role: true,
        costCenters: {
          select: {
            costCenterId: true,
            status: true,
          },
        },
      },
    });

    return user;
  }

  async removeAllAssignments(
    userId: string,
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        UserAssignment: {
          deleteMany: {},
        },
      },
    });
  }

  async findOneModule(
    data: Prisma.ModuleFindFirstArgs,
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.module.findFirst(data);
  }

  async findManyAssignments(
    data: Prisma.AssignmentFindManyArgs,
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.assignment.findMany(data);
  }

  async findOneRole(
    data: Prisma.RoleFindFirstArgs,
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.role.findFirst(data);
  }

  async findManyRoles(
    rolesNames: RoleEnum[],
    transaction?: Prisma.TransactionClient,
  ): Promise<RoleDto[]> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.role.findMany({
      where: {
        status: StatusEnum.ACTIVE,
        name: {
          in: rolesNames,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async updateUserPassword(
    id: string,
    password: string,
    transaction: Prisma.TransactionClient,
  ): Promise<void> {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
        recoveryToken: null,
        version: {
          increment: 1,
        },
      },
    });
  }
}
