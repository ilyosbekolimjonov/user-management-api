import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client"
import * as bcrypt from 'bcrypt'
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const adminEmail = 'ilyosbek@tizim.com'

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await prisma.user.create({
            data: {
                fullName: 'Ilyosbek Olimjonov',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                status: 'active'
            }
        })
        console.log('Admin successfully created', adminEmail)
    }
    else {
        console.log('Admin already available')
    }
}

main().catch(e => {
    console.log('❌ Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
        await prisma.$disconnect();
    });
