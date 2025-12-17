
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Granting permissions...')
    try {
        // Grant usage on public schema (usually default, but good to ensure)
        await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO anon;`)

        // Grant execute on the specific function
        await prisma.$executeRawUnsafe(`GRANT EXECUTE ON FUNCTION login_patient(text, text) TO anon;`)

        // Also grant to authenticated just in case
        await prisma.$executeRawUnsafe(`GRANT EXECUTE ON FUNCTION login_patient(text, text) TO authenticated;`)

        console.log('✅ Permissions granted successfully')
    } catch (e) {
        console.error('❌ Error granting permissions:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
