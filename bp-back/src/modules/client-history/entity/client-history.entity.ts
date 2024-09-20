import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { $Enums, ClientHistory } from '@prisma/client';
import { BaseEntity } from 'src/modules/base/base.entity';

// TODO-GENERATOR: IMPLEMENT THE INTERFACE
// TODO-GENERATOR: PUT THE @ApiProperty() in each property
export class ClientHistoryEntity extends BaseEntity implements ClientHistory {
  @ApiProperty()
  @AutoMap()
  observation: string;

  @ApiProperty()
  @AutoMap()
  clientId: string;
}
