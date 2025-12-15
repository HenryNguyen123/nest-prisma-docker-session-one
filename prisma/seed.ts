import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth/password.utils';

const prisma = new PrismaClient();

async function main() {
  /* =========================
   * ROLES
   * ========================= */
  const superAdminRole = await prisma.role.upsert({
    where: { code: 'SUPERADMIN' },
    update: {},
    create: {
      code: 'SUPERADMIN',
      name: 'Super Admin',
      description: 'Full permissions',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: 'Administrator',
      description: 'Manage system',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { code: 'USER' },
    update: {},
    create: {
      code: 'USER',
      name: 'User',
      description: 'Normal user',
    },
  });

  /* =========================
   * PASSWORD
   * ========================= */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const password: string = await hashPassword('123456');

  /* =========================
   * USERS
   * ========================= */

  // SUPER ADMIN
  await prisma.user.upsert({
    where: { email: 'super@admin.com' },
    update: {},
    create: {
      email: 'super@admin.com',
      userName: 'superadmin',
      password,
      firstName: 'Super',
      lastName: 'Admin',
      roleId: superAdminRole.id,
      profile: {
        create: {
          bio: 'Super administrator of system',
        },
      },
    },
  });

  // ADMIN
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      userName: 'admin',
      password,
      firstName: 'Admin',
      lastName: 'System',
      roleId: adminRole.id,
      profile: {
        create: {
          bio: 'System administrator',
        },
      },
    },
  });

  // NORMAL USER
  await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {},
    create: {
      email: 'user@gmail.com',
      userName: 'user',
      password,
      firstName: 'Normal',
      lastName: 'User',
      roleId: userRole.id,
      profile: {
        create: {
          bio: 'Normal user profile',
        },
      },
    },
  });

  console.log('Seed database successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
