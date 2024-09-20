import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsNumber, IsNotEmpty, Length, IsString } from 'class-validator';

export class ClientHistoryUpdateDto implements Prisma.ClientHistoryUpdateInput {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Length(3, 255, {
    message:
      'The observation must be between $constraint1 and $constraint2 characters.',
  })
  observation?: string;

  @ApiProperty()
  clientId?: string;

  @ApiProperty({
    description: 'Versão da ClientHistory',
    example: 1,
  })
  @IsNumber({}, { message: 'O campo version deve ser um número' })
  @IsNotEmpty({ message: 'A versão é obrigatória' })
  version: number;
}
