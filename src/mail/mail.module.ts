import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [CacheModule.register()],
  providers: [PrismaService, RedisService],
})
export class MailModule {}
