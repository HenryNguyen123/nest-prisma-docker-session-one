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
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  //step1: register user
  @Post('register')
  @UseInterceptors(FileInterceptor('avatar', { dest: 'tmp/' }))
  // @UseInterceptors(
  //   FileInterceptor('avatar', {
  //     storage: diskStorage({
  //       destination: (req, file, cb) => {
  //         const uploadPath = join(
  //           process.cwd(),
  //           '..',
  //           'public',
  //           'images',
  //           'avatar',
  //         );
  //         // tạo folder nếu chưa tồn tại
  //         console.log('path disk: ', uploadPath);
  //         if (!existsSync(uploadPath)) {
  //           mkdirSync(uploadPath, { recursive: true });
  //         }
  //         cb(null, uploadPath);
  //       },
  //       filename: (req, file, cb) => {
  //         const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         const safeName = file.originalname.replace(/\s+/g, '-');
  //         cb(null, `${unique}-${safeName}`);
  //       },
  //     }),
  //   }),
  // )
  async register(
    @Body() body: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<IResponse> {
    try {
      console.log('file controler: ', file);
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
    @Res({ passthrough: true }) response: Response,
  ): Promise<IResponse> {
    try {
      const data = await this.authService.login(body, response);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (data && data.DT?.access_token) {
        const isProduction = process.env.NODE_ENV === 'production';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        response.cookie('JWT', data.DT.access_token, {
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
    @Res({ passthrough: true }) response: Response,
  ): Promise<IResponse> {
    try {
      const data = await this.authService.validateGoogleUser(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        req.user,
        response,
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
      const errorString = JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
        2,
      );

      return responseError(errorString, -500);
    }
  }
}
