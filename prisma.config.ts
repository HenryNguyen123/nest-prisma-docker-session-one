import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

export const prisma = new PrismaClient({
  // Nếu dùng direct database connection:
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
export { PrismaClient };
