import { ApiProperty } from '@nestjs/swagger';
import { EventEnum, EventTypeEnum, Prisma } from '@prisma/client';
import { BaseEntity } from 'src/modules/base/base.entity';

// TODO-GENERATOR: INSERT THE DTO SELECT PAGINATION HERE
export class EventPaginationResponse extends BaseEntity {
  @ApiProperty({ type: String, example: '2dsajkdsajk312' })
  id: string;

  @ApiProperty({ type: String, example: '192.168.0.1' })
  ip: string;

  @ApiProperty({ type: String, example: 'Mario' })
  userName: string;

  @ApiProperty({ enum: EventEnum, example: 'Mario' })
  event: EventEnum;

  @ApiProperty({ type: String, example: '{}' })
  additionalData: Prisma.JsonValue | null;

  @ApiProperty({ type: String, example: 'Usuário fez login' })
  description: string;

  @ApiProperty({ enum: EventTypeEnum, example: 'Usuário fez login' })
  type: EventTypeEnum;

  @ApiProperty({ type: Date, example: '2021-09-01T00:00:00.000Z' })
  createdAt: Date;
}
