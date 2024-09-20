import { $Enums, CostCenter } from '@prisma/client';
import { BaseEntity } from 'src/modules/base/base.entity';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
export class CostCenterEntity extends BaseEntity implements CostCenter {
  name: string;
  description: string;
  clientId: string;
}
