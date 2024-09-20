import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditLog, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import {
  isDevelopmentEnviroment,
  isTestEnviroment,
} from 'src/utils/environment';

import { LogService } from '../log/log.service';
import { countLoggedUsers } from '../websocket/websocket.service';
import { CronRepository } from './cron.repository';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly cronRepository: CronRepository,
    private readonly logService: LogService,
    private readonly prisma: PrismaService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  /**
   * Scheduled task that runs every day at midnight to upload logs to the MongoDB database.
   *
   * @description This method is a scheduled cron job that runs at midnight every day.
   *              It is responsible for uploading logs to the MongoDB database.
   *              The method first checks the environment and skips the upload in
   *              development or test environments. It retrieves logs from the logs database,
   *              uploads them to MongoDB, and then cleans the logs database.
   *              Any errors during the process are logged.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async uploadLogsToMongo() {
    const identifierRequest = randomUUID();
    this.logger.debug(`${identifierRequest} Uploading logs to mongo database`);

    if (isDevelopmentEnviroment() || isTestEnviroment()) {
      this.logger.debug(
        `${identifierRequest} Skipping cron upload logs in development or test enviroment`,
      );
      return;
    }

    try {
      this.prisma.$transaction(
        async (transaction: Prisma.TransactionClient) => {
          const logsDatabase: AuditLog[] = await this.logService.getAuditLogs();

          this.logger.debug(
            `${identifierRequest} Logs retrieved from database, count: ${logsDatabase.length}`,
          );

          await this.logService.createLogCache(logsDatabase, {
            identifierRequest,
          });

          await this.logService.cleanAuditLogs({
            transaction,
            identifierRequest,
          });

          this.logger.debug(
            `${identifierRequest} Logs uploaded to mongo database`,
          );
        },
        {
          maxWait: 30000,
          timeout: 30000,
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      this.logger.error('Error uploading logs to mongo database', error);
    }
  }

  /**
   * Scheduled task that runs every 30 minutes to log the connected users in the application.
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async logLoggedUsers() {
    this.logger.log(`Logged users: ${countLoggedUsers}`);
  }
}
