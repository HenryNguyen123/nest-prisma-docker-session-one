import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RegisterDto, LoginDto } from 'src/auth/dtos/auth.dto';
import type { Response, Request } from 'express';
import { responseError, responseSuccess } from 'src/utils/response.utils';
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
  register(@Body() body: RegisterDto): Promise<IResponse> {
    return this.authService.register(body);
  }
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IResponse> {
    const data = await this.authService.login(body);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data && data.DT?.access_token) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.cookie('JWT', data.DT.access_token, {
        httpOnly: true,
        maxAge: 3600, // 1 giờ
        // secure: process.env.NODE_ENV === 'production',
        // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: true,
        sameSite: 'none',
        path: '/',
      });
    }
    return data;
  }
  @Post('logout')
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(
    @Body() body: LogoutBody,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IResponse> {
    try {
      // Clear cookie trực tiếp
      res.clearCookie('JWT', {
        httpOnly: true,
        secure: true, // Render HTTPS
        sameSite: 'none', // cross-domain
        path: '/',
      });

      return responseSuccess('Logout successfully!', 0, { path: body.path });
    } catch (error) {
      console.log('Logout error: ', error);
      return responseError(JSON.stringify(error), -500);
    }
    // try {
    //   console.log('body la: ', body);
    //   const data = await this.authService.logout(body, req, res);
    //   return data;
    // } catch (error: unknown) {
    //   console.log(error);
    //   return responseError('Internal server error', -500);
    // }
  }
}
