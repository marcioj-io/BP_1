import { Injectable, Logger } from '@nestjs/common';

import { AWSService } from '../base/aws.service';

@Injectable()
export class BucketS3Service {
  private logger = new Logger(BucketS3Service.name);

  constructor(private readonly AWSService: AWSService) {}

  public async uploadFileToS3(
    file: Express.Multer.File,
    bucketName: string,
    path: string,
  ) {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 7);

    const fileName = `${timestamp}_${random}_${file?.originalname || 'file'}`;

    const S3: AWS.S3 = this.AWSService.getS3();

    const results = await S3.upload({
      Key: path + fileName,
      Bucket: bucketName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();
    return results;
  }

  public async getSignedUrl(
    bucketName: string,
    objectKey: string,
    expirationInSeconds: number,
  ): Promise<string> {
    const S3: AWS.S3 = this.AWSService.getS3();

    const params = {
      Bucket: bucketName,
      Key: objectKey,
      Expires: expirationInSeconds,
    };

    return new Promise((resolve, reject) => {
      S3.getSignedUrl('getObject', params, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  }

  public async deleteFile(fullLink: string, bucketName: string) {
    const S3: AWS.S3 = this.AWSService.getS3();

    const fileName: string = new URL(fullLink).pathname.slice(1);

    const decodedFileName = decodeURIComponent(fileName);

    this.logger.debug(`[S3] Deleting file ${bucketName} - ${decodedFileName}`);

    await S3.deleteObject({
      Bucket: bucketName,
      Key: decodedFileName,
    }).promise();
  }
}
