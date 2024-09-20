import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleEnum, StatusEnum } from '@prisma/client';

export class CostCenterIds {
  @ApiProperty({
    description: 'Id do centro de custo',
    example: 'dkifja7fa89s7fa9sdf',
  })
  costCenterId: string;

  @ApiProperty({
    description: 'Status do centro de custo',
    enum: StatusEnum,
  })
  status: StatusEnum;
}
export class UserPayload {
  @ApiProperty({
    description: 'Sub da token',
    example: 'dkifja7fa89s7fa9sdf',
  })
  sub: string;

  @ApiProperty({
    description: 'Id do usuário',
    example: 'dkifja7fa89s7fa9sdf',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'Admin',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'admin@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Tentativas de logins falhas do usuário',
    example: 2,
  })
  loginAttempts: number;

  @ApiProperty({
    description: 'Role do usuário',
    enum: RoleEnum,
  })
  role: string;

  @ApiProperty({
    description: 'Permissões do usuário',
    example: [
      {
        assignment: 'USER',
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      {
        assignment: 'COMPANY',
        create: true,
        read: true,
        update: true,
        delete: true,
      },
    ],
  })
  assignments: {
    assignment: string;
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  }[];

  @ApiProperty({
    description: 'Status do usuário',
    enum: StatusEnum,
  })
  status: StatusEnum;

  @ApiProperty({
    description: 'Bloqueado',
    example: false,
  })
  blocked: boolean;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Data de atualização do usuário',
    example: '2021-01-01T00:00:00.000Z',
  })
  deletedAt?: string | null;

  @ApiProperty({
    description: 'Versão do usuário',
    example: 1,
  })
  version: number;

  @ApiProperty({
    description: 'Data de criação da token',
    example: '2021-01-01T00:00:00.000Z',
  })
  iat: number;

  @ApiProperty({
    description: 'Data de expiração da token',
    example: '2021-01-01T00:00:00.000Z',
  })
  exp: number;

  @ApiProperty({
    description: 'IP do usuário',
    example: '12.23.542.123.22',
  })
  ip: string;

  @ApiProperty({
    description: 'Id do cliente',
    example: 'dkifja7fa89s7fa9sdf',
  })
  clientId?: string;

  @ApiProperty({
    description: 'Ids dos centros de custo',
    example: [{ costCenterId: 'dkifja7fa89s7fa9sdf', status: 'ACTIVE' }],
    type: [CostCenterIds],
  })
  costCenters?: CostCenterIds[];

  // Inserted in the RT Guard
  refreshToken?: string;
}
