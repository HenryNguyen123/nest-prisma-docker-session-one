import { Controller, Get } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  @Get('test')
  async test() {
    const value = await this.redisService.testCache();
    return { value };
  }
}
