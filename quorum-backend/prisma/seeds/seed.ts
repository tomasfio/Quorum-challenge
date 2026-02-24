import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PERMISSIONS = [
    { name: 'USER_READ' },
    { name: 'USER_WRITE' },
    { name: 'USER_PERMISSION_WRITE' },
    { name: 'USER_ROLE_WRITE' },
    { name: 'ROLE_PERMISSION_WRITE' },
  ];

const ROLES = [
    { name: 'ADMIN' },
    { name: 'CLIENT' },
  ];


async function main() {
    for (const p of PERMISSIONS) {
        await prisma.permission.upsert({
            where: { name: p.name },
            update: { name: p.name },
            create: p,
        });
    }

    for (const r of ROLES) {
        await prisma.role.upsert({
            where: { name: r.name },
            update: { name: r.name },
            create: r,
        });
    }
}


main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());