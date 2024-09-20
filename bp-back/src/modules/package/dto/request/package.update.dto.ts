import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { IsNumber, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

class priceRangesDto {
  @ApiProperty({
    example: 10,
  })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: 1000,
  })
  @IsNotEmpty()
  price: Decimal;
}

export class SourceDto {
  @ApiProperty()
  @IsNotEmpty()
  id: string;
}
export class PackageUpdateDto implements Prisma.PackageUpdateInput {
  @ApiProperty({
    description: 'Versão da Package',
    example: 1,
  })
  @IsNumber({}, { message: 'O campo version deve ser um número' })
  @IsNotEmpty({ message: 'A versão é obrigatória' })
  version: number;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  deliveryForecastInDays?: number;

  @ApiProperty()
  @IsOptional()
  simpleForm?: boolean;

  @ApiProperty()
  @IsOptional()
  notes: string;

  @ApiProperty()
  @IsOptional()
  clientId: string;

  @ApiProperty()
  @IsOptional()
  priceRanges: priceRangesDto[];

  @ApiProperty({
    example: [],
    description: 'Fontes de pesquisa',
    type: [SourceDto],
  })
  @IsOptional()
  @IsArray({ message: 'O campo sources deve ser um array' })
  sources: SourceDto[];

  clients?: Prisma.ClientUncheckedCreateNestedManyWithoutPackagesInput;
}
