import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from 'src/database/prisma/prisma.module';

import { LogModule } from '../log/log.module';
import { MongoService } from '../mongo/mongo.service';
import { CronRepository } from './cron.repository';
import { CronService } from './cron.service';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, LogModule],
  controllers: [],
  providers: [CronService, CronRepository, MongoService],
  exports: [],
})
export class CronModule {}
