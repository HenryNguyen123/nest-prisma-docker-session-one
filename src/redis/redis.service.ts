import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async incr(key: string, seconds?: number) {
    try {
      const current = (await this.cacheManager.get(key)) || 0;
      const count: number = Number(current) + 1;
      if (seconds) {
        await this.cacheManager.set(key, count, seconds);
      } else {
        await this.cacheManager.set(key, count, 60 * 1000);
      }
      return count;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async set(key: string, data: any, seconds: number) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await this.cacheManager.set(key, data, seconds);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async get(key: string): Promise<any> {
    try {
      return await this.cacheManager.get(key);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async del(key: string) {
    try {
      return await this.cacheManager.del(key);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async expire(key: string, seconds: number) {
    try {
      const value = await this.cacheManager.get(key);
      if (value) {
        await this.cacheManager.set(key, value, seconds * 1000);
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async testCache() {
    // set cache key
    await this.cacheManager.set('test-key', 'Hello Redis', 30);
    // get cache key
    const value = await this.cacheManager.get('test-key');
    return value;
  }
}
