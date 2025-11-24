import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
// import { existsSync, mkdirSync } from 'fs';

// const uploadPath = join(__dirname, '..', 'public', 'images', 'avatar');
// if (!existsSync(uploadPath)) {
//   mkdirSync(uploadPath, { recursive: true });
// }
@Module({
  imports: [
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '..', 'public'),
      serveRoot: '/public',
    }),
    MulterModule.register({
      dest: join(process.cwd(), '..', 'public', 'images', 'avatar'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
