import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusEnum } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import {
  CrudType,
  CrudTypeMap,
} from 'src/modules/base/interfaces/ICrudTypeMap';

export enum IOrderByDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class DefaultFilter<T extends CrudTypeMap> {
  @IsOptional()
  @ApiPropertyOptional()
  page?: number = 1;

  @IsOptional()
  @ApiPropertyOptional()
  perPage?: number = 10;

  @IsOptional()
  @ApiPropertyOptional()
  search?: string;

  @IsOptional()
  @IsEnum(StatusEnum)
  @ApiPropertyOptional({
    enum: StatusEnum,
    example: StatusEnum.ACTIVE,
  })
  status?: StatusEnum;

  @IsOptional()
  @ApiPropertyOptional({
    example: IOrderByDirection.DESC,

    enum: IOrderByDirection,
  })
  order?: IOrderByDirection;

  @IsOptional()
  @ApiPropertyOptional({
    example: ['id', 'name'],
  })
  orderBy?: any;

  query: Record<string, any>[];

  where?: T[CrudType.WHERE];

  select?: T[CrudType.SELECT];
}
