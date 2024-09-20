import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Package } from '@prisma/client';
import { BaseEntity } from 'src/modules/base/base.entity';

import { priceRangesDto } from '../dto/request/package.create.dto';

export class PackageEntity extends BaseEntity implements Package {
  @ApiProperty()
  @AutoMap()
  deliveryForecastInDays: number;

  @ApiProperty()
  @AutoMap()
  name: string;

  @ApiProperty()
  @AutoMap()
  simpleForm: boolean;

  @ApiProperty()
  @AutoMap()
  notes: string;

  @ApiProperty()
  @AutoMap()
  clientId: string;

  @ApiProperty()
  @AutoMap()
  PriceRanges?: priceRangesDto[];

  @ApiProperty({
    description: 'fontes of search',
  })
  @AutoMap()
  sources?: any[];
}
