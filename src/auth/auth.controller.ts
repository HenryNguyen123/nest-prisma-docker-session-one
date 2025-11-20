import { Controller, Post, Body, Res, Req } from '@nestjs/common';
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
  register(@Body() body: RegisterDto): Promise<any> {
    return this.authService.register(body);
  }
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    const data = await this.authService.login(body);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (data && data.DT?.access_token) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.cookie('JWT', data.DT.access_token, {
        httpOnly: true,
        maxAge: 3600000, // 1 giờ
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      });
    }
    return data;
  }
  @Post('logout')
  async logout(
    @Body() body: LogoutBody,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<IResponse> {
    try {
      console.log('body la: ', body);
      const data = await this.authService.logout(body, req, res);
      return data;
    } catch (error: unknown) {
      console.log(error);
      return responseError('Internal server error', -500);
    }
  }
}
