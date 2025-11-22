import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RegisterDto, LoginDto } from 'src/auth/dtos/auth.dto';
import type { Response, Request } from 'express';
import { responseError } from 'src/utils/response.utils';
import type { LogoutBody } from '../auth/types/auth.type';
interface IResponse {
  EM: string;
  EC: number;
  DT: any;
}
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  async cregister(@Body() body: RegisterDto): Promise<IResponse> {
    try {
      const data = await this.authService.register(body);
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
}
