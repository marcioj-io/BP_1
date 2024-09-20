import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  maxLength,
} from 'class-validator';

import { AssignmentDto } from '../common.dto';

export class UserCreateDto {
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

  @ApiProperty({
    example: 'Breno Silva',
    description: 'Nome do usuário',
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

  @ApiPropertyOptional({
    description: 'ID do client',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'O campo id do client deve ser uma string' })
  clientId?: string;

  @ApiProperty({
    description: 'ID da Role',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
  })
  @IsNotEmpty({ message: 'O campo de função deve ser preenchido' })
  @IsString({ message: 'O campo de função deve ser uma string' })
  roleId: string;

  @ApiProperty({
    description: 'Dados do assignment',
    type: [AssignmentDto],
  })
  @IsArray({ message: 'O campo de permissionamento deve ser um array' })
  @ArrayMinSize(1, {
    message: 'O campo de permissionamento deve ter no mínimo 1 item',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AssignmentDto)
  assignments: AssignmentDto[];

  @ApiPropertyOptional({
    example: 'Imagem do usuário',
    description: 'www.google.com.br',
  })
  @IsOptional()
  @IsString({ message: 'O campo de imagem deve ser uma string' })
  @Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' && value?.trim(),
  )
  image?: string;

  @ApiPropertyOptional({
    example: [],
    description: 'Centros de custo',
  })
  @IsOptional()
  @IsArray({ message: 'O campo costCenters deve ser um array' })
  costCenters?: string[];

  @ApiPropertyOptional({
    example: [],
    description: 'Fontes de pesquisa',
  })
  @IsOptional()
  @IsArray({ message: 'O campo sources deve ser um array' })
  sources?: string[];

  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  ownsClient?: boolean;
}
