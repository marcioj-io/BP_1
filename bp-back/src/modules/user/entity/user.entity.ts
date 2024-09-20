import { AutoMap } from '@automapper/classes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusEnum, User } from '@prisma/client';
import { BaseEntity } from 'src/modules/base/base.entity';
import { RoleEntity } from 'src/modules/base/entity/role.entity';

import { Media } from '../../base/entity/media.entity';
import { UserAssignmentEntity } from './user.assignment.entity';

export class UserEntity extends BaseEntity implements User {
  @ApiProperty({
    example: 'true',
    description: 'Whether the user owns the client',
  })
  @AutoMap()
  ownsClient: boolean;

  @ApiProperty({
    example: 'true',
    description: 'Whether the user owns the client',
  })
  @AutoMap()
  costCenters?: any[];

  @ApiProperty({
    description: 'fontes of search',
  })
  @AutoMap()
  sources?: any[];

  @ApiProperty({
    description: 'Id of client',
    example: 'dkifja7fa89s7fa9sdf',
  })
  clientId: string;

  @ApiProperty({
    description: 'Id of cost center',
    example: 'dkifja7fa89s7fa9sdf',
  })
  costCenterId?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @AutoMap()
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @AutoMap()
  email: string;

  password: string;

  @ApiProperty({
    example: 0,
    description: 'Number of attempted logins',
  })
  @AutoMap()
  loginAttempts: number;

  @ApiProperty({
    type: () => [RoleEntity],
  })
  @AutoMap(() => RoleEntity)
  Role?: RoleEntity;

  @ApiProperty({
    example: 'active',
    description: 'Account status',
    enum: StatusEnum,
  })
  @AutoMap()
  status: StatusEnum;

  @ApiProperty({
    example: false,
    description: 'Whether the user is blocked',
  })
  @AutoMap()
  blocked: boolean;

  @ApiPropertyOptional({
    example: '192.168.1.1',
    description: 'IP address of the user',
  })
  @AutoMap()
  ip: string;

  @ApiPropertyOptional({
    example: 'sometoken',
    description: 'Refresh token for the user',
  })
  @AutoMap()
  refreshToken: string;

  @ApiPropertyOptional({
    example: 'sometoken',
    description: 'Recovery token for email reset',
  })
  @AutoMap()
  recoveryToken: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'The unique identifier for the related media',
  })
  @AutoMap()
  mediaId: string;

  @ApiPropertyOptional({
    description: 'Related media content',
    type: () => Media,
  })
  @AutoMap(() => Media)
  Media?: Media;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier for the role',
  })
  roleId: string;

  @ApiPropertyOptional({
    description: 'Related Assignments',
    type: () => [UserAssignmentEntity],
  })
  @AutoMap(() => UserAssignmentEntity)
  UserAssignment?: UserAssignmentEntity[];
}
