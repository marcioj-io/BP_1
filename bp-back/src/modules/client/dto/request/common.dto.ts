import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class AddressDto {
  @ApiProperty({ example: 'SP', description: 'State' })
  @IsNotEmpty({ message: 'State field must be filled' })
  @IsString({ message: 'State field must be a string' })
  @Length(3, 50, {
    message: 'General Note field must be between 3 and 50 characters',
  })
  state: string;

  @ApiProperty({ example: 'Sao Paulo', description: 'City' })
  @IsNotEmpty({ message: 'City field must be filled' })
  @IsString({ message: 'City field must be a string' })
  @Length(3, 50, {
    message: 'General Note field must be between 3 and 50 characters',
  })
  city: string;

  @ApiProperty({ example: 'Santana', description: 'Neighborhood' })
  @IsNotEmpty({ message: 'Neighborhood field must be filled' })
  @IsString({ message: 'Neighborhood field must be a string' })
  @Length(3, 100, {
    message: 'General Note field must be between 3 and 50 characters',
  })
  neighborhood: string;

  @ApiProperty({ example: 'R. Anibal Benevolo', description: 'Street' })
  @IsNotEmpty({ message: 'Street field must be filled' })
  @IsString({ message: 'Street field must be a string' })
  @Length(3, 100, {
    message: 'General Note field must be between 3 and 50 characters',
  })
  street: string;

  @ApiProperty({ example: '94', description: 'Number' })
  @IsNotEmpty({ message: 'Number field must be filled' })
  @IsString({ message: 'Number field must be a string' })
  number: string;

  @ApiProperty({ example: '2 Andar', description: 'Complement' })
  @IsNotEmpty({ message: 'Complement field must be filled' })
  @IsString({ message: 'Complement field must be a string' })
  @Length(3, 100, {
    message: 'General Note field must be between 3 and 50 characters',
  })
  complement: string;

  @ApiProperty({ example: '02016040', description: 'Zip Code' })
  @IsNotEmpty({ message: 'Zip Code field must be filled' })
  @IsString({ message: 'Zip Code field must be a string' })
  @Length(3, 10, {
    message: 'General Note field must be between 3 and 50 characters',
  })
  zipCode: string;
}

export class ObservationDto {
  @ApiProperty({ example: 'Lorem ipsum', description: 'Observation' })
  @IsNotEmpty({ message: 'Observation field must be filled' })
  @IsString({ message: 'Observation field must be a string' })
  @Length(3, 255, {
    message: 'General Note field must be between 3 and 255 characters',
  })
  observation: string;

  @ApiProperty({ example: 'Lorem ipsum', description: 'Observation' })
  @IsOptional()
  id?: string;
}
