import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class priceRangesDto {
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

export class PackageCreateDto implements Prisma.PackageUncheckedCreateInput {
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
  clientId?: string;

  @ApiProperty({
    example: {
      amount: 10,
      price: 1000,
    },
  })
  @IsOptional()
  priceRanges?: priceRangesDto[];

  @ApiProperty({
    example: [],
    description: 'Fontes de pesquisa',
    type: [SourceDto],
  })
  @IsOptional()
  @IsArray({ message: 'O campo sources deve ser um array' })
  sources: SourceDto[];

  version?: number;
  clients?: Prisma.ClientUncheckedCreateNestedManyWithoutPackagesInput;
}
