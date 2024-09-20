import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventEnum, EventTypeEnum } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { DefaultFilter, IOrderByDirection } from 'src/filters/DefaultFilter';

import { EventTypeMap } from '../../entity/event.type.map';

export class DefaultFilterEvent extends DefaultFilter<EventTypeMap> {
  @IsOptional()
  @ApiPropertyOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(EventTypeEnum)
  @Transform(({ value }) => value.toUpperCase())
  type: EventTypeEnum;

  @IsOptional()
  @IsEnum(EventEnum)
  @Transform(({ value }) => value.toUpperCase())
  event: EventEnum;

  @IsOptional()
  @ApiPropertyOptional()
  startDate: Date;

  @IsOptional()
  @ApiPropertyOptional()
  endDate: Date;
}
