import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma/prisma.module';
import { ClientHistoryController } from './client-history.controller';
import { ClientHistoryMapping } from './client-history.mapping';
import { ClientHistoryRepository } from './client-history.repository';
import { ClientHistoryService } from './client-history.service';

@Module({
  controllers: [ClientHistoryController],
  providers: [
    ClientHistoryService,
    ClientHistoryMapping,
    ClientHistoryRepository,
  ],
  imports: [PrismaModule],
  exports: [ClientHistoryService, ClientHistoryRepository],
})
export class ClientHistoryModule {}
