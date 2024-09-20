import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Prisma } from '@prisma/client';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ClientHistoryCreateDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(3, 255, {
    message:
      'The observation must be between $constraint1 and $constraint2 characters.',
  })
  observation: string;

  @ApiProperty()
  clientId: string;
}
