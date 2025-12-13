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
  //step: call bot in render
  @Get('ping')
  ping() {
    return { status: 'alive' };
  }
  //step: link use in login app with facebook
  @Get('data-deletion')
  dataDeletion(@Res() res: Response) {
    res.status(200).send(`
      <h1>Data Deletion Instructions</h1>
      <p>Người dùng có thể gửi email tới <strong>nhokkudo143@gmail.com</strong> để xóa dữ liệu. Chúng tôi sẽ xử lý trong vòng 7 ngày.</p>
    `);
  }
  //step
  @Get('terms-of-service')
  termsOfService(@Res() res: Response) {
    res.status(200).send(`
      <h1>Terms of Service</h1>
      <p>These are the rules of using our app...</p>
    `);
  }
  //step
  @Get('privacy-policy')
  privacyPolicy(@Res() res: Response) {
    res.status(200).send(`
      <h1>Privacy Policy</h1>
      <p>Chúng tôi tôn trọng quyền riêng tư của người dùng. Dữ liệu sẽ chỉ được sử dụng cho mục đích cung cấp dịch vụ.</p>
    `);
  }
  //test cookies
  @Get('test-cookie')
  testCookies(@Res() res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('test_cookie', 'test_cookie', {
      httpOnly: true,
      maxAge: 3600 * 1000,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    });
    console.log('test cockies');
  }
}
