import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Prisma, Source } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { BaseEntity } from 'src/modules/base/base.entity';

export class SourceEntity extends BaseEntity implements Source {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  unitCost: Decimal;

  @ApiProperty()
  validityInDays: number;

  @ApiProperty()
  application: $Enums.ApplicationEnum;

  @ApiProperty()
  requiredFieldsGeral: string[];

  @ApiProperty()
  requiredFieldsPF: string[];

  @ApiProperty()
  requiredFieldsPJ: string[];

  @ApiProperty()
  extraInformation: string[];
}
