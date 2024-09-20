import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma/prisma.module';
import { SourceController } from './source.controller';
import { SourceMapping } from './source.mapping';
import { SourceRepository } from './source.repository';
import { SourceService } from './source.service';

@Module({
  controllers: [SourceController],
  providers: [SourceService, SourceMapping, SourceRepository],
  imports: [PrismaModule],
  exports: [SourceService, SourceRepository],
})
export class SourceModule {}
