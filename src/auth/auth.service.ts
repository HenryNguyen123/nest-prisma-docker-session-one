import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { responseSuccess, responseError } from '../utils/response.utils';
import type {
  RegisterType,
  LogoutBody,
  ResetPasswordType,
} from '../auth/types/auth.type';
import { Request, Response } from 'express';
import { hashPassword, checkPassword } from '../utils/auth/password.utils';
import { multerImage } from '../utils/auth/multerFile.utils';
import type { IResponse } from '../types/response/res.types';
import { verifyJWT } from '../utils/jwt/jwt.utils';
import { MailService } from 'src/mail/mail.service';
import { RateLimitedLoginService } from 'src/rate-limited/rate-limited-login.service';

interface ProfileType {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private rateLimitedLoginService: RateLimitedLoginService,
  ) {}
  //step1: register service
  async register(
    dataUser: RegisterDto,
    file?: Express.Multer.File,
  ): Promise<IResponse> {
    try {
      //step1:check user
      const user = await this.prismaService.user.findUnique({
        where: { email: dataUser.email },
      });
      if (user) {
        if (process.env.NODE_ENV === 'development') {
          throw new HttpException(
            { message: 'this email has been used error' },
            HttpStatus.UNAUTHORIZED,
          );
        }
        return responseError('User is exist, fail!', 1);
      }

      //step2:change password
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const hashPass = await hashPassword(dataUser.password);

      // step3: setup file image avatar
      let avatarUrl: string | null = null;
      if (file) {
        const multerImg = await multerImage(file);
        avatarUrl = multerImg;
      }
      // step4: create user
      const res: RegisterType = await this.prismaService.user.create({
        data: {
          email: dataUser.email,
          userName: dataUser.userName,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          password: hashPass,
          phone: Number(dataUser.phone),
          firstName: dataUser.firstName ?? '',
          lastName: dataUser.lastName ?? '',
          avatar: avatarUrl,
          age: dataUser.age ? parseInt(dataUser.age.toString()) : null,
          dob: dataUser.dob ? new Date(dataUser.dob) : undefined,
          role: 'USER',
        },
      });
      return responseSuccess('created user successfully!', 0, res);
    } catch (error: unknown) {
      console.log(error);
      return responseError('Internal server error', -500);
    }
  }
  //step2: login service
  async login(
    dataLogin: LoginDto,
    response: Response,
    req: Request,
  ): Promise<IResponse> {
    try {
      console.log(dataLogin);
      //step: check rate limit login
      const ip = req.ip;
      const key = `login-rate-limited:${ip}`;
      //step: check login failed: max 5 attemts
      try {
        const checkCountLogin = await this.rateLimitedLoginService.get(key);
        if (checkCountLogin && Number(checkCountLogin) >= 5) {
          return responseError(
            'Login failed: max 5 attempts. Please wait 60 seconds.',
            1,
          );
        }
        await this.rateLimitedLoginService.del(key);
      } catch (error) {
        console.log(error);
      }
      // check user
      const user = await this.prismaService.user.findUnique({
        where: { userName: dataLogin.userName },
      });
      if (!user) {
        // if (process.env.NODE_ENV === 'development') {
        //   throw new HttpException(
        //     { message: 'check user login error' },
        //     HttpStatus.UNAUTHORIZED,
        //   );
        // }
        return responseError('Nothing find user, fail', 1);
      }
      //check pass
      const verify: boolean = await checkPassword(
        dataLogin.password,
        user.password,
      );
      if (!verify) {
        //step: password fail set inrc rate limited login
        try {
          const count: number | null =
            await this.rateLimitedLoginService.incr(key);
          console.log('check count login: ', count);
          if (count && count >= 5) {
            return responseError(
              'Login failed: max 5 attempts. Please wait 60 seconds.',
              1,
            );
          }
        } catch (error) {
          console.log(error);
        }
        return responseError('Please, check password or userName, fails', 1);
      }
      // generate access-token and refresh token
      const timeExpire = dataLogin.rememberUser ? '1h' : '1m';
      const RetimeExpire = dataLogin.rememberUser ? '7d' : '1m';
      const payload = {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        age: user.age,
      };
      const keyJWT = process.env.JWT_SECRET_KEY;
      const keyJWTReset = process.env.JWT_SECRET_KEY_RESET ?? '';
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: keyJWT,
        expiresIn: timeExpire,
      });
      const resetToken: string = await this.jwtService.signAsync(payload, {
        secret: keyJWTReset,
        expiresIn: RetimeExpire,
      });
      // setup cookie client
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = await this.jwtService.verify(accessToken, {
        secret: keyJWT,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decodedReset = await verifyJWT(resetToken, keyJWTReset);
      // this.jwtService.verify(resetToken, {
      //   secret: keyJWTReset,
      // });
      if (decoded || decodedReset) {
        //step: delete redis if login success
        await this.rateLimitedLoginService.del(key);
        const isProduction = process.env.NODE_ENV === 'production';
        response.cookie('JWT', accessToken, {
          httpOnly: true,
          maxAge: 3600 * 1000,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          path: '/',
        });
        return responseSuccess('Login user successfully!', 0, {
          access_token: accessToken,
          reset_token: resetToken,
          data: payload,
        });
      }
      return responseError('Login user fail!', 1);
    } catch (error: unknown) {
      console.log(error);
      return responseError('Internal server error', -500);
    }
  }
  //step3: logout service
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(
    body: LogoutBody,
    req: Request,
    res: Response,
  ): Promise<IResponse> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const token = req.cookies?.JWT;

      if (!token) {
        return responseError('JWT không tìm thấy', -1);
      }
      const data = { path: body.path };
      res.clearCookie('JWT', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      });
      console.log('path name: ', data);
      return responseSuccess('Logout successfuly!', 0, data);
    } catch (error: unknown) {
      console.log(error);
      return responseError('Internal server error', 503);
    }
  }
  //step4: reset token service
  async verifyResetToken(token: string) {
    try {
      const key = process.env.JWT_SECRET_KEY_FORGOT_PASSWORD ?? '';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decode = await verifyJWT(token, key);
      const data = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        email: decode.email,
        success: true,
      };
      return responseSuccess('verify reset token, successfuly!', 1, data);
    } catch (error) {
      console.log(error);
      return responseError('Internal server error', -500);
    }
  }
  //step5: reset password service
  async resetPassword(
    body: ResetPasswordType,
    response: Response,
    request: Request,
  ): Promise<IResponse> {
    try {
      //step1: check verify jwt
      const key = process.env.JWT_SECRET_KEY_FORGOT_PASSWORD ?? '';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const token: string = request.cookies['FORGETPASS'];
      if (!token) {
        // if (process.env.NODE_ENV === 'development') {
        //   throw new HttpException(
        //     { message: 'Cant not find token, error' },
        //     HttpStatus.UNAUTHORIZED,
        //   );
        // }
        return responseError(
          'Password reset token has expired or is no longer valid.',
          1,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decode = await verifyJWT(token, key);
      if (!decode) {
        // if (process.env.NODE_ENV === 'development') {
        //   throw new HttpException(
        //     { message: 'reset pass can not find jwt, error' },
        //     HttpStatus.UNAUTHORIZED,
        //   );
        // }
        return responseError(
          'Password reset token has expired or is no longer valid.',
          1,
        );
      }
      //step2: check  email
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const rawEmail = decode?.email ?? decode?.payload?.email;
      const email = String(rawEmail).trim();
      if (!email) {
        // if (process.env.NODE_ENV === 'development') {
        //   throw new HttpException(
        //     { message: 'reset pass can not find emal, error' },
        //     HttpStatus.UNAUTHORIZED,
        //   );
        // }
        return responseError(
          'Unable to retrieve email from the reset password token.',
          1,
        );
      }
      // step: check user
      const user = await this.prismaService.user.findUnique({
        where: { email: email },
      });
      if (!user) {
        // if (process.env.NODE_ENV === 'development') {
        //   throw new HttpException(
        //     { message: 'reset pass can not find user, error' },
        //     HttpStatus.UNAUTHORIZED,
        //   );
        // }
        return responseError(
          'Your account information is incorrect or does not exist. Please check again.',
          1,
        );
      }

      // step3: hash password and update password user
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const hashPass = await hashPassword(body.resetPassword);
      const data = await this.prismaService.user.update({
        where: {
          email: email,
        },
        data: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          password: hashPass,
        },
      });
      //step4: clear cookie forgot password and login
      response.clearCookie('FORGETPASS');
      response.clearCookie('JWT');
      //step5: send mail change password success
      if (data) {
        await this.mailService.sendMailConfirmForgotPassword(email);
      }
      return responseSuccess('Password has been reset successfully!', 0, []);
    } catch (error: unknown) {
      console.log(error);
      return responseError('Internal server error', -500);
    }
  }
  // step6: oauth 2.0 login by google
  async validateOauthLogin(
    profile: ProfileType,
    response: Response,
  ): Promise<IResponse> {
    try {
      //step check mail in file strategy
      let getMail: string | null = profile?.email ?? null; // check facebook not get mail
      if (!getMail) {
        getMail = `${profile.firstName}-${profile.lastName}@facebook-mail-client-oauth.com`;
      }
      //step check have user in database
      let user = await this.prismaService.user.findUnique({
        where: { email: getMail },
      });
      if (!user) {
        const passClient: string =
          process.env.PASSWORD_CLIENT_HASH_CODE ?? profile.firstName;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const hashPass: string = await hashPassword(passClient);
        user = await this.prismaService.user.create({
          data: {
            email: getMail,
            userName: getMail,
            password: hashPass,
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatar: profile.picture,
          },
        });
      }
      // generate access-token and refresh token
      const payload = {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        age: user.age,
      };
      const keyJWT = process.env.JWT_SECRET_KEY;
      const keyJWTReset = process.env.JWT_SECRET_KEY_RESET ?? '';
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: keyJWT,
        expiresIn: '1h',
      });
      const resetToken: string = await this.jwtService.signAsync(payload, {
        secret: keyJWTReset,
        expiresIn: '7d',
      });
      // setup cookie client
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = await this.jwtService.verify(accessToken, {
        secret: keyJWT,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decodedReset = await verifyJWT(resetToken, keyJWTReset);
      // this.jwtService.verify(resetToken, {
      //   secret: keyJWTReset,
      // });
      if (decoded && decodedReset) {
        const isProduction = process.env.NODE_ENV === 'production';
        response.cookie('JWT', accessToken, {
          httpOnly: true,
          maxAge: 3600 * 1000,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          path: '/',
        });
        return responseSuccess('Login user successfully!', 0, {
          access_token: accessToken,
          reset_token: resetToken,
          data: payload,
        });
      }
      return responseError('Login user fail!', 1);
    } catch (error: unknown) {
      console.log(error);
      return responseError('login user fail', -500);
    }
  }
}
