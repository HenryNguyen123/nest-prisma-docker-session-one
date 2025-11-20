import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { cors } from './config/configCors';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  cors(app);
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
