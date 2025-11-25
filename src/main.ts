import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { cors, corsDev } from './config/configCors';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
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
  console.log('Production template dir:', join(__dirname, 'templates'));
  await app.listen(process.env.PORT ?? 4000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
