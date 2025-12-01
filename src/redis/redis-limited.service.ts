import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class LoginRateLimitedRedisService {
  private client;
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.client = createClient({ url: process.env.REDIS_URL });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.client.connect();
  }
  async inrc(key: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return await this.client.inrc(key);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async get(key: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return await this.client.get(key);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async expire(key: string, seconds: number) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return await this.client.expire(key, seconds);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}
