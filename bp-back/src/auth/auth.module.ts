import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { EmailService } from 'src/modules/email/email.service';
import { EventModule } from 'src/modules/event/event.module';
import { AWSService } from 'src/modules/infra/base/aws.service';
import { BucketS3Module } from 'src/modules/infra/s3/bucket.module';
import { LogModule } from 'src/modules/log/log.module';
import { MongoService } from 'src/modules/mongo/mongo.service';
import {
  WebsocketSchema,
  WebsocketSchemaName,
} from 'src/modules/mongo/websocket.model';
import { UserRepository } from 'src/modules/user/user.repository';
import { UserService } from 'src/modules/user/user.service';
import { WebsocketModule } from 'src/modules/websocket/websocket.module';

import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies/at.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    AWSService,
    LocalStrategy,
    AtStrategy,
    RtStrategy,
    UserService,

    UserRepository,
    EmailService,
    MongoService,
  ],
  imports: [
    PrismaModule,
    JwtModule,
    LogModule,
    EventModule,
    WebsocketModule,
    BucketS3Module,
    MongooseModule.forFeature([
      { name: WebsocketSchemaName, schema: WebsocketSchema },
    ]),
  ],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
