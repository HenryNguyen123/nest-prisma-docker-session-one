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
      const mailForm: string = process.env.SENDGRID_MAIL_NOREPLY ?? '';
      sgMail.setApiKey(key);

      const msg = {
        to: 'nhokkudo143@gmail.com',
        from: mailForm,
        subject: 'test send gmail',
        html: `
        <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>hello minh</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.5; }
              p { margin-bottom: 16px; }
            </style>
          </head>
          <body>
            <h2>mail send</h2>

            <p>Dòng 1: Đây là email test nội dung dài vừa phải.</p>
            <p>Dòng 2: Email được tạo thủ công để kiểm tra hiển thị trong Gmail.</p>
            <p>Dòng 3: Mỗi dòng đều có ý nghĩa để .</p>
            <p>Dòng 4: Đây chỉ là email thử nghiệm, không phải quảng cáo.</p>
            <p>Dòng 5: Nội dung email phải có ngữ cảnh rõ ràng.</p>
            <p>Dòng 6: Chúng tôi đang kiểm tra hệ thống gửi mail SendGrid.</p>
            <p>Dòng 7: Đây là đoạn văn bản bổ sung với nội dung khác nhau.</p>
            <p>Dòng 8: Các nội dung đa dạng giúp vượt qua bộ lọc spam của Gmail.</p>
            <p>Dòng 9: Email test kết thúc tại đây.</p>
            <p>Dòng 10: Cảm ơn đại ca đã kiểm tra!</p>
          </body>
        </html>
        `,
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
