import { ApiProperty } from '@nestjs/swagger';
import { ApplicationEnum, Prisma } from '@prisma/client';
import { DecimalJsLike } from '@prisma/client/runtime/library';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class SourceUpdateDto implements Prisma.SourceUpdateInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString({ message: 'O campo name deve ser uma string' })
  @Length(3, 50, { message: 'O campo name deve ter entre 3 e 50 caracteres' })
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsArray({ message: 'O campo requiredFieldsGeral deve ser um array' })
  requiredFieldsGeral: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray({ message: 'O campo requiredFieldsPF deve ser um array' })
  requiredFieldsPF: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray({ message: 'O campo requiredFieldsPJ deve ser um array' })
  requiredFieldsPJ: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray({ message: 'O campo extraInformation deve ser um array' })
  extraInformation: string[];

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'O campo name deve ser uma string' })
  @Length(3, 255, { message: 'O campo name deve ter entre 3 e 255 caracteres' })
  description: string;

  @ApiProperty()
  @IsEnum(ApplicationEnum)
  application: ApplicationEnum;

  @ApiProperty({ example: 123.45 })
  @IsOptional()
  @IsNumber({}, { message: 'O campo unitCost deve ser um número' })
  unitCost?: string | number | Prisma.Decimal | DecimalJsLike;

  @ApiProperty()
  @IsOptional()
  @IsNumber({}, { message: 'O campo validityInDays deve ser um número' })
  @IsInt({ message: 'O campo validityInDays deve ser um número inteiro' })
  @Min(1, { message: 'O campo validityInDays deve ser no mínimo 1' })
  @Max(31, { message: 'O campo validityInDays deve ser no máximo 31' })
  validityInDays?: number;

  @ApiProperty({
    description: 'Versão da Source',
    example: 1,
  })
  @IsNumber({}, { message: 'O campo version deve ser um número' })
  @IsNotEmpty({ message: 'A versão é obrigatória' })
  version: number;
}
