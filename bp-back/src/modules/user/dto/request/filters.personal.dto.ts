import { StatusEnum } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { DefaultFilter } from 'src/filters/DefaultFilter';

import { UserTypeMap } from '../../entity/user.type.map';

export class DefaultFilterUser extends DefaultFilter<UserTypeMap> {
  @IsOptional()
  @IsEnum(StatusEnum)
  @Transform(({ value }) => value.toUpperCase())
  status: StatusEnum;
}
