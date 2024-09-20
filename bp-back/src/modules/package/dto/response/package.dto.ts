import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';

class PriceRangeDto {
  @AutoMap()
  @ApiProperty()
  id: string;

  @AutoMap()
  @ApiProperty()
  minConsultations: number;

  @AutoMap()
  @ApiProperty()
  maxConsultations: number;

  @AutoMap()
  @ApiProperty()
  price: string;

  @AutoMap()
  @ApiProperty()
  createdAt: Date;

  @AutoMap()
  @ApiProperty()
  updatedAt: Date;

  @AutoMap()
  @ApiProperty()
  deletedAt: Date;

  @AutoMap()
  @ApiProperty()
  version: number;

  @AutoMap()
  @ApiProperty()
  status: string;

  @AutoMap()
  @ApiProperty()
  priceRangeId: string;
}

export class PackageDto {
  @AutoMap()
  @ApiProperty()
  id: string;

  @AutoMap()
  @ApiProperty()
  name: string;

  @AutoMap()
  @ApiProperty()
  deliveryForecastInDays: number;

  @AutoMap()
  @ApiProperty()
  simpleForm: boolean;

  @AutoMap()
  @ApiProperty()
  notes: string;

  @AutoMap()
  @ApiProperty()
  createdAt: Date;

  @AutoMap()
  @ApiProperty()
  updatedAt: Date;

  @AutoMap()
  @ApiProperty()
  deletedAt: Date;

  @AutoMap()
  @ApiProperty()
  version: number;

  @AutoMap()
  @ApiProperty()
  status: string;

  @AutoMap()
  @ApiProperty()
  clientId: string;

  @AutoMap(() => PriceRangeDto)
  @ApiProperty({ type: () => [PriceRangeDto] })
  priceRanges: PriceRangeDto[];
}
