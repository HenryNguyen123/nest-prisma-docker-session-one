import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class RateLimitedLoginService {
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
  async get(key: string) {
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
}
