import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AuthRepository } from 'src/auth/auth.repository';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/database/prisma/prisma.service';

import { PrismaModule } from '../../database/prisma/prisma.module';
import { EmailService } from '../email/email.service';
import { EventModule } from '../event/event.module';
import { EventService } from '../event/event.service';
import { AWSService } from '../infra/base/aws.service';
import { BucketS3Service } from '../infra/s3/bucket.service';
import { LogModule } from '../log/log.module';
import { MongoService } from '../mongo/mongo.service';
import { WebsocketSchema, WebsocketSchemaName } from '../mongo/websocket.model';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';
import { WebsocketModule } from '../websocket/websocket.module';
import { ClientController } from './client.controller';
import { ClientMapping } from './client.mapping';
import { ClientRepository } from './client.repository';
import { ClientService } from './client.service';

@Module({
  controllers: [ClientController],
  providers: [
    ClientService,
    ClientMapping,
    ClientRepository,
    AuthService,
    AWSService,
    AuthRepository,
    UserService,
    UserRepository,
    EmailService,
    MongoService,
    BucketS3Service,
  ],
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule,
    LogModule,
    EventModule,
    WebsocketModule,
    MongooseModule.forFeature([
      { name: WebsocketSchemaName, schema: WebsocketSchema },
    ]),
  ],
  exports: [ClientService, ClientRepository],
})
export class ClientModule {}
