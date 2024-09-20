import { Injectable } from '@nestjs/common';
import { Prisma, StatusEnum } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async validateIpUser(
    idUser: string,
    ipRequest: string,
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.user.findFirst({
      where: {
        id: idUser,
        ip: ipRequest,
      },
      select: {
        ip: true,
        id: true,
        email: true,
      },
    });
  }

  async activeUser(id: string, transaction?: Prisma.TransactionClient) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        status: StatusEnum.ACTIVE,
      },
    });
  }

  async incrementLoginAttempts(
    email: string,
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error('User not found or deleted');
    }

    // Incrementar loginAttempts com base no id do usuário encontrado
    return await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        loginAttempts: {
          increment: 1,
        },
      },
    });
  }

  async blockUser(email: string, transaction?: Prisma.TransactionClient) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        blocked: true,
      },
    });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
    transaction?: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
  }

  async updateIpUser(
    id: string,
    ip: string,
    transaction: Prisma.TransactionClient,
  ) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        ip,
      },
    });
  }

  async logoutUser(userId: string, transaction?: Prisma.TransactionClient) {
    const prisma: Prisma.TransactionClient | PrismaService = transaction
      ? transaction
      : this.prisma;

    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
        recoveryToken: null,
        ip: null,
      },
    });
  }
}
