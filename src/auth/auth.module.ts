import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from 'src/auth/google/google.strategy';
import { FacebookStrategy } from 'src/auth/facebook/facebook.strategy';

@Module({
  imports: [PassportModule.register({ session: false })], //set passport by @nesjt/passport
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService, //database
    JwtService, // jwt
    MailService, // mailer
    GoogleStrategy, //google
    FacebookStrategy, //facebook
  ],
})
export class AuthModule {}
