import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  //step: link use in login app with facebook
  @Get('data-deletion')
  dataDeletion(@Res() res: Response) {
    res.status(200).send(`
      <h1>Data Deletion Instructions</h1>
      <p>Người dùng có thể gửi email tới <strong>nhokkudo143@gmail.com</strong> để xóa dữ liệu. Chúng tôi sẽ xử lý trong vòng 7 ngày.</p>
    `);
  }
}
