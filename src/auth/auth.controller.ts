import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { RegisterDto, LoginDto } from 'src/auth/dtos/auth.dto';
import type { Response } from 'express';
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
        maxAge: 3600 * 1000, // 1 giờ
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }
    return data;
  }
}
