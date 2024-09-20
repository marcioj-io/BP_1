import { Injectable } from '@nestjs/common';
import { Prisma, RoleEnum, StatusEnum } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

import { RoleDto } from '../user/dto/response/assignments.dto';

@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}
