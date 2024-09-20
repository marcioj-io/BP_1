import { ApiProperty } from '@nestjs/swagger';
import { Prisma, StatusEnum } from '@prisma/client';
import {
  IsNumber,
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsEnum,
} from 'class-validator';

// TODO-GENERATOR: INSERT THE DTO UPDATE PROPERTIES HERE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
// TODO-GENERATOR: PUT THE @IsNotEmpty() in each property or @IsOptional() to be recognized in request
export class CostCenterUpdateDto implements Prisma.CostCenterUpdateInput {
  @ApiProperty({
    description: 'Versão da CostCenter',
    example: 1,
  })
  @IsNumber({}, { message: 'O campo version deve ser um número' })
  @IsNotEmpty({ message: 'A versão é obrigatória' })
  version: number;

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
