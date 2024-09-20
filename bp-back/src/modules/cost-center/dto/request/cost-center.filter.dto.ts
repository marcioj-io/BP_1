import { IsOptional, IsString } from 'class-validator';
import { DefaultFilter } from 'src/filters/DefaultFilter';

import { CostCenterTypeMap } from '../../entity/cost-center.type.map';

export class DefaultFilterCostCenter extends DefaultFilter<CostCenterTypeMap> {
  @IsOptional()
  @IsString()
  clientId: string;
}
