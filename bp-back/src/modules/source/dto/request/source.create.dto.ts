import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { DecimalJsLike } from '@prisma/client/runtime/library';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDecimal,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function IsObject(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isObject',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return typeof value === 'object' && value !== null;
        },
        defaultMessage(args: ValidationArguments) {
          return 'O campo additionalFields deve ser um objeto';
        },
      },
    });
  };
}

export class SourceCreateDto implements Prisma.SourceCreateInput {
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
}
