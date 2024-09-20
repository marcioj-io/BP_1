import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CacheSchemaName } from '../mongo/cache.model';
import { Cache } from '../mongo/cache.model';
import { MongoService } from '../mongo/mongo.service';
import { CACHE_IDENTIFIER } from './cache-identifier';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    private readonly mongoService: MongoService,
    @InjectModel(CacheSchemaName) private readonly mongoModel: Model<Cache>,
  ) {}

  /**
   * Creates or updates a cache entry with the specified data.
   *
   * @param {any} data - The data to be cached.
   * @param {CACHE_IDENTIFIER} cacheIdentifier - The identifier for the cache category.
   * @param {string} [uniqueIdentifier] - Optional unique identifier to create a specific cache key.
   * @description This method creates or updates a cache entry in the MongoDB database.
   *              The cache key is generated using the cache identifier and, if provided,
   *              a unique identifier. The data is stored as a JSON string.
   */
  async createCache(
    data: any,
    cacheIdentifier: CACHE_IDENTIFIER,
    uniqueIdentifier?: string,
  ) {
    const cacheKey = `${cacheIdentifier}${
      uniqueIdentifier && '_' + uniqueIdentifier.toUpperCase()
    }`;

    this.logger.debug('Creating data cache on key: ' + cacheKey);

    await this.mongoService.upsert<Cache>(
      { key: cacheKey },
      { $set: { key: cacheKey, value: JSON.stringify(data) } },
      this.mongoModel,
    );
  }

  /**
   * Retrieves a cache entry based on the provided identifiers.
   *
   * @param {CACHE_IDENTIFIER} cacheIdentifier - The identifier for the cache category.
   * @param {string} [uniqueIdentifier] - Optional unique identifier to locate a specific cache key.
   * @returns {Promise<any>} A promise that resolves to the cached data, or an empty array if not found.
   * @description This method retrieves a cache entry from the MongoDB database.
   *              The cache key is generated using the cache identifier and, if provided,
   *              a unique identifier. The retrieved data is parsed from a JSON string.
   */
  async getCache(
    cacheIdentifier: CACHE_IDENTIFIER,
    uniqueIdentifier?: string,
  ): Promise<any> {
    const cacheKey = `${cacheIdentifier}${
      uniqueIdentifier && '_' + uniqueIdentifier.toUpperCase()
    }`;

    this.logger.debug('Getting data from cache on key: ' + cacheKey);

    const cache = await this.mongoService.findOne<Cache>(
      { key: cacheKey },
      this.mongoModel,
    );

    if (!cache) {
      return [];
    }

    return JSON.parse(cache.value);
  }
}
