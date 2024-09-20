import { classes } from '@automapper/classes';
import {
  CamelCaseNamingConvention,
  SnakeCaseNamingConvention,
} from '@automapper/core';
import { AutomapperModule } from '@automapper/nestjs';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { AtGuard } from './auth/guards';
import { AssignmentsGuard } from './auth/guards/assignments.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { PrismaModule } from './database/prisma/prisma.module';
import { AllExceptionsFilter } from './middlewares/exception.filter';
import { HTTPLoggerMiddleware } from './middlewares/logger.middleware';
import { RequestIpMiddleware } from './middlewares/request.ip.middleware';
import { UserDisabledMiddleware } from './middlewares/user-disabled.middleware';
import { CacheModule } from './modules/cache/cache.module';
import { ClientHistoryModule } from './modules/client-history/client-history.module';
import { ClientModule } from './modules/client/client.module';
import { CostCenterModule } from './modules/cost-center/cost-center.module';
import { CronModule } from './modules/crons/cron.module';
import { EmailModule } from './modules/email/email.module';
import { EventModule } from './modules/event/event.module';
import { HealthCheckModule } from './modules/healthCheck/healthCheck.module';
import { LogModule } from './modules/log/log.module';
import { MongoService } from './modules/mongo/mongo.service';
import { PackageModule } from './modules/package/package.module';
import { SourceModule } from './modules/source/source.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UserModule } from './modules/user/user.module';
import { WebsocketModule } from './modules/websocket/websocket.module';

export const THROTTLER_LIMIT = 10;

@Module({
  providers: [
    { provide: APP_GUARD, useClass: AtGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: AssignmentsGuard },
    { provide: APP_GUARD, useClass: RequestIpMiddleware },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    MongoService,
  ],
  imports: [
    TenantModule,
    EmailModule,
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        limit: THROTTLER_LIMIT,
        ttl: 30000,
      },
    ]),
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
      namingConventions: {
        source: new CamelCaseNamingConvention(),
        destination: new SnakeCaseNamingConvention(),
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    LogModule,
    CronModule,
    CacheModule,
    HealthCheckModule,
    PrismaModule,
    WebsocketModule,
    UserModule,
    EmailModule,
    ClientModule,
    CostCenterModule,
    PackageModule,
    SourceModule,
    CostCenterModule,
    ClientHistoryModule,
    EventModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(UserDisabledMiddleware)
      .exclude(
        { path: '/api/auth/login', method: RequestMethod.ALL },
        { path: '/api/auth/register/logout', method: RequestMethod.ALL },
        { path: '/api/auth/me', method: RequestMethod.ALL },
        { path: '/api/auth/resend', method: RequestMethod.ALL },
        { path: '/api/auth/email/availability', method: RequestMethod.ALL },
        { path: '/api/auth/forgot/password', method: RequestMethod.ALL },
        { path: '/api/auth/register/account', method: RequestMethod.ALL },
      )
      .forRoutes('*');

    consumer.apply(RequestIpMiddleware).forRoutes('*');

    consumer.apply(HTTPLoggerMiddleware).forRoutes('*');
  }
}
