import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';

@Module({
  providers: [BotService],
  controllers: [BotController],
})
export class BotModule {}
