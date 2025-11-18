import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { cors } from './config/configCors';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  cors(app);
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
