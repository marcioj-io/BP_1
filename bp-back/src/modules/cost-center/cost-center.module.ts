import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma/prisma.module';
import { CostCenterController } from './cost-center.controller';
import { CostCenterMapping } from './cost-center.mapping';
import { CostCenterRepository } from './cost-center.repository';
import { CostCenterService } from './cost-center.service';

@Module({
  controllers: [CostCenterController],
  providers: [CostCenterService, CostCenterMapping, CostCenterRepository],
  imports: [PrismaModule],
  exports: [CostCenterService, CostCenterRepository],
})
export class CostCenterModule {}
