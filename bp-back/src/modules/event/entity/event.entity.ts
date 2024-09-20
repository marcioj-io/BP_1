import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Event, EventEnum, Prisma } from '@prisma/client';
import { BaseEntity } from 'src/modules/base/base.entity';

export class User {
  @ApiProperty()
  name: string;
}
export class EventEntity extends BaseEntity implements Event {
  @ApiProperty()
  ip: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  User?: User;

  @ApiProperty()
  id: string;

  @ApiProperty()
  event: EventEnum;

  @ApiProperty()
  additionalData: Prisma.JsonValue;

  @ApiProperty()
  description: string;

  @ApiProperty()
  type: $Enums.EventTypeEnum;
}
