import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PingBotService {
  private readonly logger = new Logger(PingBotService.name);
  private readonly url = `${process.env.DOMAIN_SERVER}/ping`;

  constructor(private readonly httpService: HttpService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async pingRender() {
    try {
      const response = await firstValueFrom(this.httpService.get(this.url));
      this.logger.log(`Ping successful: ${JSON.stringify(response.data)}`);
    } catch (error) {
      this.logger.error(`Ping failed: ${error}`);
    }
  }
}
