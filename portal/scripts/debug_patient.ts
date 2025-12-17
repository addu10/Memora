import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching all patients...');
    const patients = await prisma.patient.findMany({
        include: {
            caregiver: true
        }
    });

    if (patients.length === 0) {
        console.log('No patients found.');
    } else {
        patients.forEach(p => {
            console.log('--- Patient ---');
            console.log(`ID: ${p.id}`);
            console.log(`Name: ${p.name}`);
            console.log(`Age: ${p.age}`);
            console.log(`Diagnosis: ${p.diagnosis}`);
            console.log(`Caregiver: ${p.caregiver?.name}`);
            console.log('---------------');
        });
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
