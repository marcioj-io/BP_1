import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

/**
 * A NestJS pipe to transform a CSV formatted string into an array of strings.
 *
 * @implements {PipeTransform<string, string[]>}
 *
 * @description
 * This pipe takes a string input, expecting a CSV (comma-separated values) format,
 * and transforms it into an array of strings. It throws a BadRequestException if the input is not a string.
 */
@Injectable()
export class ArrayCsvFormatToArrayPipe
  implements PipeTransform<string, string[]>
{
  transform(value: string): string[] {
    if (!value) {
      return [];
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('Array is invalid');
    }

    return value.split(',');
  }
}
