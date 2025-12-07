import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);
  @Cron(CronExpression.EVERY_5_MINUTES)
  handleTask() {
    this.logger.log('Bot is alive and working!');
  }
}
