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

const isDev = process.env.NODE_ENV !== 'production';
const templateDir = isDev
  ? join(process.cwd(), 'templates')
  : join(__dirname, 'templates');
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
    //step2: setup mailer
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // host SMTP
        port: 587, // port SSL
        secure: false,
        auth: {
          user: process.env.EMAIL_USER, // email gửi
          pass: process.env.EMAIL_PASS, // app password nếu dùng Gmail
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@example.com>',
      },
      template: {
        dir: templateDir, // folder chứa file email template
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    MailModule,
    PrismaModule,
  ],
  controllers: [AppController, MailController],
  providers: [AppService, MailService],
})
export class AppModule {}
