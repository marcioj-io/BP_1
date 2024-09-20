import { Module } from '@nestjs/common';

import { AWSService } from '../base/aws.service';
import { BucketS3Service } from './bucket.service';

@Module({
  providers: [BucketS3Service, AWSService],
  imports: [],
  exports: [BucketS3Service],
})
export class BucketS3Module {}
