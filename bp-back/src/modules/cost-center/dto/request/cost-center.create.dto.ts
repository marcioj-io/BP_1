import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Prisma, StatusEnum } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CostCenterCreateDto
  implements Prisma.CostCenterUncheckedCreateInput
{
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters' })
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(3, 100, { message: 'Name must be between 3 and 100 characters' })
  description: string;

  @ApiProperty({ enum: StatusEnum })
  @IsOptional()
  @IsEnum(StatusEnum)
  status: StatusEnum;
}
