import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

export const fileInterceptor = (
  fieldName: string,
  maxFileSize: number,
  allowedMimeTypes: string[],
) => {
  return FileInterceptor(fieldName, {
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        cb(new BadRequestException('Invalid file type'), false);
      }

      if (file.size > maxFileSize) {
        cb(new BadRequestException('File is too large'), false);
      }
      cb(null, true);
    },
  });
};
