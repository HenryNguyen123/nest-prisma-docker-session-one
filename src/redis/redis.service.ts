import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async testCache() {
    // set cache key
    await this.cacheManager.set('test-key', 'Hello Redis', 30);
    // get cache key
    const value = await this.cacheManager.get('test-key');
    return value;
  }
}
