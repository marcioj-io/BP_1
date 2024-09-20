import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CacheSchema, CacheSchemaName } from '../mongo/cache.model';
import { MongoService } from '../mongo/mongo.service';
import { CacheService } from './cache.service';

@Module({
  providers: [CacheService, MongoService],
  exports: [CacheService],
  imports: [
    MongooseModule.forFeature([{ name: CacheSchemaName, schema: CacheSchema }]),
  ],
})
export class CacheModule {}
