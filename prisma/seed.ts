import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth/password.utils';

const prisma = new PrismaClient();

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPERADMIN' },
    update: {},
    create: {
      id: 1,
      code: 'SUPERADMIN',
      name: 'Super Admin',
      description: 'Full permissions',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      id: 2,
      code: 'ADMIN',
      name: 'Administrator',
      description: 'Manage system',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const userRole = await prisma.role.upsert({
    where: { code: 'USER' },
    update: {},
    create: {
      id: 3,
      code: 'USER',
      name: 'User',
      description: 'Normal user',
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const password = await hashPassword('123456');
  // User Superadmin
  await prisma.user.upsert({
    where: { email: 'super@admin.com' },
    update: {},
    create: {
      email: 'super@admin.com',
      userName: 'superadmin',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password,
      firstName: 'Super',
      lastName: 'Admin',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      role: { connect: { id: superAdminRole.id } },
    },
  });

  // User Admin
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      userName: 'admin',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password,
      firstName: 'Admin',
      lastName: 'System',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      role: { connect: { id: adminRole.id } },
    },
  });

  // User Normal
  await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {},
    create: {
      email: 'user@gmail.com',
      userName: 'user',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      password,
      firstName: 'Normal',
      lastName: 'User',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      role: { connect: { id: userRole.id } },
    },
  });
  console.log('seed database');
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
