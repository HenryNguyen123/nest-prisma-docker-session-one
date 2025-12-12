import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { cors, corsDev } from './config/cors.config';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  if (process.env.NODE_ENV === 'production') {
    cors(app);
  } else {
    corsDev(app);
  }
  // Serve static folder 'public' với prefix '/public'
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public/',
  });
  //fix favicon.ico
  app.use(
    '/favicon.ico',
    express.static(join(__dirname, '..', 'public', 'favicon.ico')),
  );
  app.set('trust proxy', 1);
  await app.listen(process.env.PORT ?? 4000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
