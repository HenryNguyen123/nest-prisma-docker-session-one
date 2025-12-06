import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import type { Response } from 'express';
import { responseError, responseSuccess } from 'src/utils/response.utils';
import { IResponse } from 'src/types/response/res.types';
import { MailerService } from '@nestjs-modules/mailer';
import sgMail from '@sendgrid/mail';
interface forgetType {
  email: string;
}
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('test-mail')
  async testMail() {
    try {
      const key: string = process.env.SENDGRID_API_KEY ?? '';
      sgMail.setApiKey(key);

      const msg = {
        to: 'nhokkudo143@gmail.com',
        from: 'nhokkudo143@gmail.com',
        subject: 'test send gmail',
        html: `<h1>Hello Minh Nhật</h1><p>SendGrid chạy OK</p>`,
      };
      await sgMail.send(msg);

      // await this.mailerService.sendMail({
      //   to: 'nhokkudo143@gmail.com',
      //   subject: 'test send gmail.',
      //   template: './test/testSendMail',
      // });
      return responseSuccess('test send mail successfuly', 0, []);
    } catch (error: unknown) {
      console.log('send mail error: ', error);
      if (process.env.NODE_ENV === 'development') {
        throw new HttpException(
          { message: 'send mail error' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const errorString = JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
        2,
      );

      return responseError(errorString, -500);
    }
  }
  //step: forgot password user
  @Post('forgot-password')
  async forgotPassword(
    @Body() body: forgetType,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IResponse> {
    try {
      //step1: clear cookie forgot password old
      response.clearCookie('FORGETPASS');
      //step2: response api
      const data = await this.mailService.sendMailForgotPassword(
        body,
        response,
      );
      return data;
    } catch (error: unknown) {
      console.log('login error: ', error);
      if (process.env.NODE_ENV === 'development') {
        throw new HttpException(
          { message: 'login error' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      return responseError('Internal server error', -500);
    }
  }
}
