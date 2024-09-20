import { ApiProperty } from '@nestjs/swagger';
import { $Enums, EventEnum, EventTypeEnum, Prisma } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class EventCreateDto {
  @ApiProperty()
  @IsString()
  ip?: string;

  @ApiProperty({ enum: EventTypeEnum, required: false })
  @IsOptional()
  @IsEnum(EventTypeEnum)
  type?: EventTypeEnum;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  event: EventEnum;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  additionalData: Prisma.JsonValue;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;
}
