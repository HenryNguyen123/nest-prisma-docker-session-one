import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Query,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RegisterDto, LoginDto } from 'src/auth/dtos/auth.dto';
import type { Response, Request } from 'express';
import { responseError, responseSuccess } from 'src/utils/response.utils';
import type { LogoutBody, ResetPasswordType } from '../auth/types/auth.type';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { AuthGuard } from '@nestjs/passport';
interface IResponse {
  EM: string;
  EC: number;
  DT: any;
}
interface ProfileType {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}
interface MeType {
  key: string;
}
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  //step0: call me
  @Post('me')
  async me(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body: MeType,
  ): Promise<IResponse> {
    try {
      const data = await this.authService.me(req, response, body);
      return data;
    } catch (error: unknown) {
      console.log('recall me, getjwt authentication: ', error);
      return responseError('Internal server error', -500);
    }
  }
  //step1: register user
  @Post('register')
  @UseInterceptors(FileInterceptor('avatar', { dest: 'tmp/' }))
  async register(
    @Body() body: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<IResponse> {
    try {
      const data = await this.authService.register(body, file);
      return data;
    } catch (error) {
      console.log('register error: ', error);
      if (process.env.NODE_ENV === 'development') {
        throw new HttpException(
          { message: 'register error' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      return responseError('Internal server error', -500);
    }
  }
  //step2: login user
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IResponse> {
    try {
      const data = await this.authService.login(body, response, req);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data && data.DT?.access_token) {
        const isProduction = process.env.NODE_ENV === 'production';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        response.cookie('AUTH', data.DT.access_token, {
          httpOnly: true,
          maxAge: 3600 * 1000,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          path: '/',
        });
      }
      return data;
    } catch (error) {
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
  //step3: logout user
  @Post('logout')
  async logout(
    @Body() body: LogoutBody,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IResponse> {
    try {
      const data = await this.authService.logout(body, req, res);
      return data;
    } catch (error: unknown) {
      console.log('Logout error: ', error);
      if (process.env.NODE_ENV === 'development') {
        throw new HttpException(
          { message: 'logout error' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      return responseError('Internal server error', -500);
    }
  }
  //step4: reset token
  @Get('verify-reset-token')
  async verifyResetToken(@Query('token') token: string): Promise<IResponse> {
    try {
      await this.authService.verifyResetToken(token);
      return responseSuccess('Token valid', 0, []);
    } catch (error: unknown) {
      console.log('Logout error: ', error);
      if (process.env.NODE_ENV === 'development') {
        throw new HttpException(
          { message: 'logout error' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      return responseError('Internal server error', -500);
    }
  }
  //step5: reset password user with email
  @Put('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordType,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ): Promise<IResponse> {
    try {
      //step1: get handle service
      const data = await this.authService.resetPassword(
        body,
        response,
        request,
      );
      return data;
    } catch (error: unknown) {
      console.log('Logout error: ', error);
      if (process.env.NODE_ENV === 'development') {
        throw new HttpException(
          { message: 'logout error' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      return responseError('Internal server error', -500);
    }
  }
  //step6: login user by OAUTH 2.0
  // #### OAuth 2.0
  // Login with GOOGLE by passport-google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}
  // get data user in callback google.strategy.ts
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      //step: set key session
      const sessionKey: string = crypto.randomUUID();
      console.log('sessionKey: ', sessionKey);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const profile: ProfileType = req?.user;
      if (!profile) {
        response.redirect(
          process.env.FRONTEND_URL + '/clients/auth/login' ||
            'http://localhost:9090',
        );
      }
      const title: string = 'GOOGLE';
      await this.authService.validateOauthLogin(
        profile,
        response,
        request,
        title,
        sessionKey,
      );
      const path: string = `${process.env.FRONTEND_URL}${process.env.FRONTEND_CALLBACK_ME_URL}?key=${sessionKey}`;
      console.log('path client: ', path);
      response.redirect(path || 'http://localhost:9090');
    } catch (error: unknown) {
      let message = 'Internal server error';
      if (error instanceof Error) {
        console.error('OAuth callback error stack:', error.stack);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        message = error.message;
      } else {
        console.error('Unknown OAuth error:', error);
      }
      console.log('Logout error: ', error);
      if (process.env.NODE_ENV === 'development') {
        throw new HttpException(
          { message: 'logout error' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      return responseError('Internal server error', -500);
    }
  }
  //step7: login
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}
  //get data callback login by facebook
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(
    @Req() req,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      //step: set key session
      const sessionKey: string = crypto.randomUUID();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const profile: ProfileType = req.user;
      console.log('profile facebook: ', profile);
      if (!profile) {
        response.redirect(
          process.env.FRONTEND_URL + '/clients/auth/login' ||
            'http://localhost:3000',
        );
      }
      const title: string = 'FACEBOOK';
      await this.authService.validateOauthLogin(
        profile,
        response,
        request,
        title,
        sessionKey,
      );
      const path: string = `${process.env.FRONTEND_URL}${process.env.FRONTEND_CALLBACK_ME_URL}?key=${sessionKey}`;
      response.redirect(path || 'http://localhost:9090');
    } catch (error: unknown) {
      console.log(error);
      if (process.env.NODE_ENV === 'development') {
        throw new HttpException(
          { message: 'logout error' },
          HttpStatus.UNAUTHORIZED,
        );
      }
      response.redirect(
        process.env.FRONTEND_URL + '/login' || 'http://localhost:9090',
      );
      return response.redirect(
        `${process.env.FRONTEND_URL}/login?error=unauthorized`,
      );
    }
  }
}
