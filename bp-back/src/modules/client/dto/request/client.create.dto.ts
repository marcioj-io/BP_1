import { ApiProperty } from '@nestjs/swagger';
import { Decimal, DecimalJsLike } from '@prisma/client/runtime/library';
import { IsCNPJ, IsPhone } from 'brazilian-class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

import { AddressDto, ObservationDto } from './common.dto';

export class UserDto {
  @ApiProperty({
    example: 'Evandro',
    description: 'Nome do usuário master',
  })
  @IsNotEmpty({ message: 'O campo de nome deve ser preenchido' })
  @IsString({ message: 'O campo de nome deve ser uma string' })
  @MaxLength(200, {
    message: 'O campo de nome deve ter menos de 200 caracteres',
  })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  name: string;

  @ApiProperty({
    example: 'emailusuario@gmail.com',
    description: 'E-mail do usuário',
  })
  @IsNotEmpty({ message: 'O campo de email deve ser preenchido' })
  @IsEmail({}, { message: 'O campo de email deve ser um e-mail válido' })
  @MaxLength(200, {
    message: 'O campo de email deve ter menos de 200 caracteres',
  })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim() && value?.toLowerCase(),
  )
  email: string;
}

export class ClientCreateDto {
  @ApiProperty({ example: 'Client Name', description: 'Client Name' })
  @IsNotEmpty({ message: 'Name field must be filled' })
  @IsString({ message: 'Name field must be a string' })
  @Length(3, 50, {
    message: 'General Note field must be between 3 and 50 characters',
  })
  name: string;

  @ApiProperty({ example: 'Legal Name', description: 'Legal Name' })
  @IsNotEmpty({ message: 'Legal Name field must be filled' })
  @IsString({ message: 'Legal Name field must be a string' })
  @Length(3, 50, { message: 'Name field must be between 1 and 50 characters' })
  legalName: string;

  @ApiProperty({ example: '10000000101', description: 'CNPJ' })
  @IsNotEmpty({ message: 'CNPJ field must be filled' })
  @IsString({ message: 'CNPJ field must be a string' })
  @IsCNPJ({ message: 'CNPJ field must be a valid CNPJ' })
  cnpj: string;

  @ApiProperty({ example: '123', description: 'State Registration' })
  @IsNotEmpty({ message: 'State Registration field must be filled' })
  @IsString({ message: 'State Registration field must be a string' })
  @Length(3, 100, {
    message: 'Name field must be between 3 and 100 characters',
  })
  stateRegistration: string;

  @ApiProperty({ example: '123', description: 'Municipal Registration' })
  @IsNotEmpty({ message: 'Municipal Registration field must be filled' })
  @IsString({ message: 'Municipal Registration field must be a string' })
  @Length(3, 100, {
    message: 'Name field must be between 3 and 100 characters',
  })
  municipalRegistration: string;

  @ApiProperty({ example: '5511999999999', description: 'Contact Phone' })
  @IsNotEmpty({ message: 'Contact Phone field must be filled' })
  @IsString({ message: 'Contact Phone field must be a string' })
  @IsPhone({ message: 'Contact Phone field must be a valid phone number' })
  contactPhone: string;

  @ApiProperty({ example: 'user@mail.com', description: 'Contact Email' })
  @IsNotEmpty({ message: 'Contact Email field must be filled' })
  @IsString({ message: 'Contact Email field must be a string' })
  contactEmail: string;

  @ApiProperty({ example: 'Leonardo', description: 'Primary Contact Person' })
  @IsNotEmpty({ message: 'Primary Contact Person field must be filled' })
  @IsString({ message: 'Primary Contact Person field must be a string' })
  @Length(3, 50, { message: 'Name field must be between 3 and 50 characters' })
  primaryContactPerson: string;

  @ApiProperty({
    example: 'Diretor',
    description: 'Primary Contact Person Title',
  })
  @IsNotEmpty({ message: 'Primary Contact Person Title field must be filled' })
  @IsString({ message: 'Primary Contact Person Title field must be a string' })
  @Length(3, 50, { message: 'Name field must be between 3 and 50 characters' })
  primaryContactPersonTitle: string;

  @ApiProperty({ example: true, description: 'Use Tax Invoice' })
  @IsOptional({ message: 'Use Tax Invoice field must be filled' })
  @IsBoolean({ message: 'Use Tax Invoice field must be a boolean' })
  useTaxInvoice?: boolean;

  @ApiProperty({ example: 'Lorem ipsum', description: 'General Note' })
  @IsNotEmpty({ message: 'General Note field must be filled' })
  @IsString({ message: 'General Note field must be a string' })
  generalNote: string;

  @ApiProperty({ example: 30, description: 'Billing Cycle Day' })
  @IsOptional({ message: 'Billing Cycle Day field must be filled' })
  @IsNumber({}, { message: 'Billing Cycle Day field must be a number' })
  billingCycleDay?: number;

  @ApiProperty({ example: 0.05, description: 'Discount' })
  @IsOptional({ message: 'Discount field must be filled' })
  @IsNumber({}, { message: 'Discount field must be a number' })
  discount?: string | number | Decimal | DecimalJsLike;

  @ApiProperty({
    type: AddressDto,
    description: 'Primary Address',
  })
  @IsOptional()
  primaryAddress?: AddressDto;

  @ApiProperty({
    type: AddressDto,
    description: 'Billing Address',
  })
  @IsOptional()
  billingAddress?: AddressDto;

  @ApiProperty({ type: [ObservationDto], description: 'Observations' })
  @IsArray({ message: 'Observations field must be an array' })
  @IsOptional()
  observations?: ObservationDto[];

  @ApiProperty({ type: [String], description: 'Packages' })
  @IsArray({ message: 'Packages field must be an array' })
  packages: string[];

  @ApiProperty({ type: [UserDto] })
  @IsNotEmpty()
  user: UserDto;

  version?: number;
}
