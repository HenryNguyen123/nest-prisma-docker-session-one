import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
// import { existsSync, mkdirSync } from 'fs';
import { MailService } from './mail/mail.service';
import { MailController } from './mail/mail.controller';
import { MailModule } from './mail/mail.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { PrismaModule } from 'src/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisController } from './redis/redis.controller';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { RateLimitedModule } from './rate-limited/rate-limited.module';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    AuthModule,
    // step1: base public
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '..', 'public'),
      serveRoot: '/public',
    }),
    // step2: client get path images
    MulterModule.register({
      dest: join(process.cwd(), '..', 'public', 'images', 'avatar'),
    }),
    //step3: setup mailer
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net', // host SMTP
        // host: 'smtp.gmail.com', // host SMTP
        // host: 'smtp-relay.brevo.com', // host SMTP
        port: 587, // port SSL
        secure: false,
        auth: {
          user: process.env.SENDGRID_API_USER,
          pass: process.env.SENDGRID_API_KEY,
          // user: process.env.SENDGRID_API_USER,
          // pass: process.env.SENDGRID_API_KEY,
          // user: process.env.EMAIL_USER,
          // pass: process.env.EMAIL_PASS,
          // user: process.env.BREVO_LOGIN,
          // pass: process.env.BREVO_SMTP_KEY,
        },
        // tls: {
        //   rejectUnauthorized: false,
        // },
      },
      defaults: {
        from: '"Minh Nhat" <nhokkudo143@gmail.com>',
        // from: '"No Reply" <no-reply@example.com>',
        // from: `"No Reply" <${process.env.BREVO_LOGIN}>`,
      },
      template: {
        dir: join(process.cwd(), 'dist', 'templates'), // folder chứa file email template
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    //step4: setup redis
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        url: process.env.REDIS_URL,
        // ttl: 60,
      }),
    }),
    MailModule,
    PrismaModule,
    RedisModule,
    RateLimitedModule,
  ],
  controllers: [AppController, MailController, RedisController],
  providers: [AppService, MailService, RedisService],
})
export class AppModule {}
