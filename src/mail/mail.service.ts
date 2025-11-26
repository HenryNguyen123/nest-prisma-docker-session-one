import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { signJWT } from '../utils/jwt/jwt.utils';
import { Response } from 'express';
import { IResponse } from 'src/types/response/res.types';
import { responseError, responseSuccess } from 'src/utils/response.utils';
// import { PrismaService } from 'src/prisma.service';
import { PrismaService } from '../prisma.service';

interface forgetType {
  email: string;
}
@Injectable()
export class MailService {
  constructor(
    private prismaService: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async sendMailForgotPassword(
    body: forgetType,
    res: Response,
  ): Promise<IResponse> {
    try {
      //step: check user
      const user = await this.prismaService.user.findUnique({
        where: { email: body.email },
      });
      if (!user) {
        if (process.env.NODE_ENV === 'development') {
          throw new HttpException(
            { message: 'check user login error' },
            HttpStatus.UNAUTHORIZED,
          );
        }
        return responseError('Nothing find user, fail', 1);
      }
      //step1: set data in token with jwt
      const key: string = process.env.JWT_SECRET_KEY_FORGOT_PASSWORD ?? '';
      const data = {
        payload: { email: body.email },
        secret: key,
        expiresIn: 900,
      };
      const token = await signJWT(data);
      //step2: set cookie
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('FORGETPASS', token, {
        httpOnly: true,
        maxAge: 900 * 1000,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
      });
      //step3: setup service email
      let url: string = '';
      // if (isProduction) {
      //   url = `${process.env.DOMAIN_SERVER}/auth/reset-password?token=${encodeURIComponent(token)}`;
      // } else {
      //   url = `http://localhost:${process.env.PORT}/auth/reset-password?token=${encodeURIComponent(token)}`;
      // }
      if (isProduction) {
        url = `${process.env.FRONTEND_URL}${process.env.FRONTEND_FORGET_PASSWORD_URL}`;
      } else {
        url = `${process.env.FRONTEND_URL}${process.env.FRONTEND_FORGET_PASSWORD_URL}`;
      }
      // const datacheck = { user: user, token: token, url: url };
      // return responseSuccess(
      //   'send mail forget password successfuly',
      //   0,
      //   datacheck,
      // );

      try {
        await this.mailerService.sendMail({
          to: body.email,
          // to: body.email,
          subject: 'Get reset password.',
          template: './auth/forgetPassword',
          context: {
            data: body,
            url: url,
          },
        });
      } catch (error: unknown) {
        console.log(error);
        if (process.env.NODE_ENV === 'development') {
          throw new HttpException(
            { message: 'reset pass can not find emal, error' },
            HttpStatus.UNAUTHORIZED,
          );
        }
        return responseError('reset pass can not find emal, error', 1);
      }
      return responseSuccess('send mail forget password successfuly', 0, []);
    } catch (error: unknown) {
      console.log(error);
      return responseError('Internal server error', -500);
    }
  }
  async sendMailConfirmForgotPassword(email: string) {
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const time = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Ho_Chi_Minh',
      });
      let url: string = '';
      if (isProduction) {
        url = `${process.env.FRONTEND_URL}${process.env.FRONTEND_FORGET_PASSWORD_URL}`;
      } else {
        url = `http://localhost:${process.env.PORT}${process.env.FRONTEND_FORGET_PASSWORD_URL}`;
      }
      await this.mailerService.sendMail({
        to: email,
        subject: 'Change password successfuly.',
        template: './auth/confirmForgetPassword',
        context: {
          email: email,
          time: time,
          resetUrl: url,
        },
      });
    } catch (error: unknown) {
      console.log(error);
      return responseError('Internal server error', -500);
    }
  }
}
