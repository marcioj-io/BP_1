import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DefaultFilter } from 'src/filters/DefaultFilter';

import { ClientHistoryTypeMap } from '../../entity/client-history.type.map';

export class DefaultFilterHistory extends DefaultFilter<ClientHistoryTypeMap> {
  @ApiProperty()
  @ApiPropertyOptional()
  clientId?: string;
}
