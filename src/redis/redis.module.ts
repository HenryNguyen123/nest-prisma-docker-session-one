import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { RedisController } from 'src/redis/redis.controller';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 5, // thời gian cache mặc định (giây)
      max: 100, // số lượng item tối đa
    }),
    RedisModule,
  ],
  controllers: [RedisController],
  providers: [RedisService],
})
export class RedisModule {}
