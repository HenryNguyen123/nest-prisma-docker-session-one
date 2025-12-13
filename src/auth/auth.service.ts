import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto, LoginDto } from './dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { responseSuccess, responseError } from '../utils/response.utils';
import type {
  RegisterType,
  LogoutBody,
  ResetPasswordType,
  MeType,
} from '../auth/types/auth.type';
import { Request, Response } from 'express';
import { hashPassword, checkPassword } from '../utils/auth/password.utils';
import { multerImage } from '../utils/auth/multerFile.utils';
import type { IResponse } from '../types/response/res.types';
import { verifyJWT } from '../utils/jwt/jwt.utils';
import { MailService } from 'src/mail/mail.service';
import { RateLimitedLoginService } from 'src/rate-limited/rate-limited-login.service';
import { RedisService } from 'src/redis/redis.service';

interface ProfileType {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}
interface ResponseLoginType {
  userName: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  age?: number | null;
  roleId: number;
  roleCode: string;
  loginBy: string;
}
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
    private rateLimitedLoginService: RateLimitedLoginService,
    private redisService: RedisService,
  ) {}
  //step0: recall me
  async me(req: Request, response: Response, body: MeType): Promise<IResponse> {
    try {
      const sessionKey: string = body.key;
      console.log('callback me sessionkey: ', sessionKey);
      const keyRedis = `Oauth2-${sessionKey}`;
      console.log('auth me keyredis: ', keyRedis);
      //step: check redis
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const dataRedis: string = await this.redisService.get(keyRedis);
      console.log('dataredis: ', dataRedis);
      if (dataRedis) {
        //step jwt and cookies
        console.log('data auth me: ', dataRedis);
        const keyJWT = process.env.JWT_SECRET_KEY;
        // setup cookie client
        const decoded: object = await this.jwtService.verify(dataRedis, {
          secret: keyJWT,
        });
        console.log('dataRedis callback: ', dataRedis);
        console.log('decode callback: ', decoded);
        // if (decoded) {
        try {
          const isProduction = process.env.NODE_ENV === 'production';
          response.cookie('AUTH', dataRedis, {
            httpOnly: true,
            maxAge: 10080 * 1000,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            path: '/',
          });
          await this.redisService.del(keyRedis);
          return responseSuccess('Login user successfully!', 0, {
            access_token: dataRedis,
            data: decoded,
          });
        } catch (error: unknown) {
          console.log(error);
          return responseError('get accout user fail', 1);
        }
        // }
        // return responseError('Login user fail!', 1);
      }
      await this.redisService.del(keyRedis);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const token: string = req.cookies?.AUTH;
      if (!token) {
        return responseError('Dont find user, get user fail', -1);
      }
      const keyAccess = process.env.JWT_SECRET_KEY ?? '';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decodeAccess = await verifyJWT(token, keyAccess);
      if (decodeAccess) {
        const payload: ResponseLoginType = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          userName: decodeAccess.userName,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          firstName: decodeAccess.firstName,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          lastName: decodeAccess.lastName,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          avatar: decodeAccess.avatar,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          age: decodeAccess.age,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          roleId: decodeAccess.roleId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          roleCode: decodeAccess.roleCode,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          loginBy: decodeAccess.loginBy,
        };
        return responseSuccess('get me, successfuly!', 0, payload);
      }
      return responseError('get accout user fail', 1);
    } catch (error: unknown) {
      console.log(error);
      return responseError('Internal server error', -500);
    }
  }
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
      const roleId: number = 3;
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
          roleId: roleId,
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
      // await this.rateLimitedLoginService.incr(key);
      try {
        const checkCountLogin = await this.rateLimitedLoginService.get(key);
        if (checkCountLogin && Number(checkCountLogin) >= 5) {
          return responseError(
            'Login failed: max 5 attempts. Please wait 60 seconds.',
            1,
          );
        }
        // await this.rateLimitedLoginService.del(key);
      } catch (error) {
        console.log(error);
      }
      // check user
      const user = await this.prismaService.user.findUnique({
        where: { userName: dataLogin.userName },
        include: { role: true },
      });
      if (!user) {
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
      const timeExpire = dataLogin.rememberUser ? '7d' : '1m';
      const timeExpireCookie = dataLogin.rememberUser ? 10080 : 60 * 60;
      const RetimeExpire = dataLogin.rememberUser ? '7d' : '1m';
      const payload: ResponseLoginType = {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        age: user.age,
        roleId: user.role?.id ?? 3,
        roleCode: user.role?.code ?? '',
        loginBy: '',
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
        const authValue = dataLogin.rememberUser ? resetToken : accessToken;
        //step: delete redis if login success
        await this.rateLimitedLoginService.del(key);
        const isProduction = process.env.NODE_ENV === 'production';
        response.cookie('AUTH', authValue, {
          httpOnly: true,
          maxAge: timeExpireCookie * 1000,
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
      const token = req.cookies?.AUTH;
      if (!token) {
        return responseError('JWT không tìm thấy', -1);
      }
      const data = { path: body.path };
      res.clearCookie('AUTH', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      });
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
      const keyParam: string = body.key;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const dataRedis: string = await this.redisService.get(keyParam);
      if (!keyParam || dataRedis != keyParam) {
        return responseError(
          'The password reset link is invalid or has already been used.',
          1,
        );
      }
      //step1: check verify jwt
      const key = process.env.JWT_SECRET_KEY_FORGOT_PASSWORD ?? '';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const token: string = request.cookies['FORGETPASS'];
      if (!token) {
        return responseError(
          'Your password reset session has expired. Please request a new reset link.',
          1,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decode = await verifyJWT(token, key);
      if (!decode) {
        return responseError(
          'We were unable to verify your account information. Please request a new password reset.',
          1,
        );
      }
      //step2: check  email
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const rawEmail = decode?.email ?? decode?.payload?.email;
      const email = String(rawEmail).trim();
      if (!email) {
        return responseError(
          'We were unable to verify your account information. Please request a new password reset.',
          1,
        );
      }
      // step: check user
      const user = await this.prismaService.user.findUnique({
        where: { email: email },
      });
      if (!user) {
        return responseError(
          'No account was found with the provided email address.',
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
      response.clearCookie('AUTH');
      //step5: send mail change password success
      if (data) {
        // await this.mailService.sendMailConfirmForgotPassword(email);
      }
      await this.redisService.del(keyParam);
      return responseSuccess(
        'Your password has been reset successfully. You can now log in with your new password.',
        0,
        [],
      );
    } catch (error: unknown) {
      console.log(error);
      return responseError(
        'Something went wrong while resetting your password. Please try again later.',
        1,
      );
    }
  }
  // step6: oauth 2.0 login by google
  async validateOauthLogin(
    profile: ProfileType,
    response: Response,
    request: Request,
    title: string,
    sessionKey: string,
  ) {
    try {
      //step check mail in file strategy
      let getMail: string | null = profile?.email ?? null; // check facebook not get mail
      console.log('mail: ', getMail);
      if (!getMail) {
        getMail = `${profile.firstName}-${profile.lastName}@facebook-mail-client-oauth.com`;
        console.log('check mail: ', getMail);
      }
      //step check have user in database
      let user = await this.prismaService.user.findUnique({
        where: { email: getMail },
        include: { role: true },
      });
      if (!user) {
        const roleId: number = 3;
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
            roleId: roleId,
          },
          include: { role: true },
        });
      }
      // generate access-token and refresh token
      const payload: ResponseLoginType = {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        age: user.age,
        roleId: user.roleId,
        roleCode: user.role?.code ?? '',
        loginBy: title,
      };
      //step: create redis oauth of frontend write by nextjs
      const keyRedis = `Oauth2-${sessionKey}`;
      console.log('key oauth2: ', keyRedis);
      //step jwt and cookies
      const keyJWT = process.env.JWT_SECRET_KEY;
      // const keyJWTReset = process.env.JWT_SECRET_KEY_RESET ?? '';
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: keyJWT,
        expiresIn: '7d',
      });
      // const resetToken: string = await this.jwtService.signAsync(payload, {
      //   secret: keyJWTReset,
      //   expiresIn: '7d',
      // });
      console.log('accessToken oauth2: ', accessToken);
      await this.redisService.set(keyRedis, accessToken, 900000);
    } catch (error: unknown) {
      console.log(error);
      return responseError('login user fail', -500);
    }
  }
}
