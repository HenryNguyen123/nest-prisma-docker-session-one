import { Controller, Post, Body } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { RegisterDto } from 'src/auth/dtos/auth.dto';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('register')
  register(@Body() body: RegisterDto): Promise<User> {
    return this.authService.register(body);
  }
}
