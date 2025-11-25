import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [PrismaService],
})
export class MailModule {}
