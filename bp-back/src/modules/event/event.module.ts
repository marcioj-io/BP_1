import { Module } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma/prisma.module';
import { EventController } from './event.controller';
import { EventMapping } from './event.mapping';
import { EventRepository } from './event.repository';
import { EventService } from './event.service';

@Module({
  controllers: [EventController],
  providers: [EventService, EventMapping, EventRepository],
  imports: [PrismaModule],
  exports: [EventService, EventRepository],
})
export class EventModule {}
