import { Module } from '@nestjs/common';
import { RateLimitedService } from './rate-limited.service';
import { CacheModule } from '@nestjs/cache-manager';
import { RateLimitedLoginService } from 'src/rate-limited/rate-limited-login.service';

@Module({
  imports: [
    CacheModule.register({
      // ttl: 5, // thời gian cache mặc định (giây)
      max: 1000, // số lượng item tối đa
    }),
    CacheModule.register(),
    RateLimitedModule,
  ],
  providers: [RateLimitedService, RateLimitedLoginService],
  exports: [RateLimitedService, RateLimitedLoginService],
})
export class RateLimitedModule {}
