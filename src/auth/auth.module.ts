import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from 'src/auth/google/google.strategy';
import { FacebookStrategy } from 'src/auth/facebook/facebook.strategy';
import { RateLimitedLoginService } from 'src/rate-limited/rate-limited-login.service';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    CacheModule.register(),
  ], //set passport by @nesjt/passport
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService, //database
    JwtService, // jwt
    MailService, // mailer
    GoogleStrategy, //google
    FacebookStrategy, //facebook
    RateLimitedLoginService,
    RedisService,
  ],
})
export class AuthModule {}
