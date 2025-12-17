
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Applying RPC function...')
    try {
        const sql = `
      create or replace function login_patient(p_name text, p_pin text)
      returns json
      language plpgsql
      security definer
      as $$
      declare
        found_patient "Patient"%rowtype;
      begin
        select *
        into found_patient
        from "Patient"
        where lower(name) = lower(p_name)
        and pin = p_pin
        limit 1;

        if found_patient.id is null then
          return json_build_object('error', 'Invalid credentials');
        end if;

        return json_build_object(
          'patientId', found_patient.id,
          'name', found_patient.name,
          'photoUrl', found_patient."photoUrl"
        );
      end;
      $$;
    `
        await prisma.$executeRawUnsafe(sql)
        console.log('✅ RPC function created successfully')
    } catch (e) {
        console.error('❌ Error applying RPC:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
