
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Granting table permissions to anon...')
    try {
        const tables = ['Memory', 'FamilyMember', 'TherapySession', 'Patient']

        for (const table of tables) {
            // Enclose table names in quotes to handle casing if necessary, 
            // though Postgres usually lowercases unless quoted. Prisma uses "PascalCase" or "camelCase" in schema, 
            // mapping to DB. Let's try both quoted and unquoted to be safe or rely on known mapping.
            // Prisma default mapping for 'Patient' is "Patient".

            await prisma.$executeRawUnsafe(`GRANT SELECT ON TABLE "${table}" TO anon;`)
            console.log(`Granted SELECT on ${table}`)
        }

        console.log('✅ Table permissions granted.')
    } catch (e) {
        console.error('❌ Error granting permissions:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
