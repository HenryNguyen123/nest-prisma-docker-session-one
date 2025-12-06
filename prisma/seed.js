"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const password_utils_1 = require("../src/utils/auth/password.utils");
const prisma = new client_1.PrismaClient();
async function main() {
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
    const password = await (0, password_utils_1.hashPassword)('123456');
    await prisma.user.upsert({
        where: { email: 'super@admin.com' },
        update: {},
        create: {
            email: 'super@admin.com',
            userName: 'superadmin',
            password,
            firstName: 'Super',
            lastName: 'Admin',
            role: { connect: { id: superAdminRole.id } },
        },
    });
    await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            email: 'admin@gmail.com',
            userName: 'admin',
            password,
            firstName: 'Admin',
            lastName: 'System',
            role: { connect: { id: adminRole.id } },
        },
    });
    await prisma.user.upsert({
        where: { email: 'user@gmail.com' },
        update: {},
        create: {
            email: 'user@gmail.com',
            userName: 'user',
            password,
            firstName: 'Normal',
            lastName: 'User',
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
//# sourceMappingURL=seed.js.map