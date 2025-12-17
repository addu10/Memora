import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    try {
        const sqlPath = path.join(process.cwd(), 'prisma', 'migrations', 'rpc_login.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Restoring login_patient RPC function...');

        // Split by semicolons to run multiple statements if needed, but rpc_login.sql is mainly one block.
        // However, the $$ blocks might confuse simple splitting.
        // Best to run the whole thing if it's a CREATE FUNCTION.

        await prisma.$executeRawUnsafe(sql);

        console.log('✅ RPC function restored successfully.');
    } catch (error) {
        console.error('❌ Error restoring RPC function:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
