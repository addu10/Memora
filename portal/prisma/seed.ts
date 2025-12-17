
const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // 1. Create Caregiver (Adnan)
    const password = await hash('password123', 12)
    const caregiver = await prisma.caregiver.upsert({
        where: { email: 'adnan@example.com' },
        update: {},
        create: {
            email: 'adnan@example.com',
            name: 'Adnan',
            password: password,
            phone: '9876543210'
        },
    })
    console.log(`Created caregiver: ${caregiver.name}`)

    // 2. Create Patient (Grandpa John)
    const patient = await prisma.patient.create({
        data: {
            name: 'John Doe',
            age: 78,
            caregiverId: caregiver.id,
            diagnosis: 'Early Stage Alzheimer\'s',
            mmseScore: 24,
            notes: 'Likes classical music and gardening.',
            pin: '1234'
        }
    })
    console.log(`Created patient: ${patient.name}`)

    // 3. Create Family Members
    const son = await prisma.familyMember.create({
        data: {
            name: 'Arjun',
            relationship: 'Son',
            photoUrls: JSON.stringify(['https://placehold.co/400?text=Arjun']),
            patientId: patient.id
        }
    })

    const wife = await prisma.familyMember.create({
        data: {
            name: 'Lakshmi',
            relationship: 'Wife',
            photoUrls: JSON.stringify(['https://placehold.co/400?text=Lakshmi']),
            patientId: patient.id
        }
    })
    console.log('Created family members: Arjun, Lakshmi')

    // 4. Create Memories
    await prisma.memory.create({
        data: {
            title: 'Diwali 2023',
            description: 'Lighting lamps at home with the whole family.',
            date: new Date('2023-11-12'),
            event: 'Festival',
            location: 'Home',
            people: 'Arjun, Lakshmi',
            importance: 5,
            photoUrls: [
                'https://placehold.co/600x400?text=Diwali+Lamps',
                'https://placehold.co/600x400?text=Family+Photo'
            ],
            patientId: patient.id
        }
    })

    await prisma.memory.create({
        data: {
            title: 'Arjun\'s Graduation',
            description: 'Proud moment for the family.',
            date: new Date('2015-05-20'),
            event: 'Ceremony',
            location: 'University',
            people: 'Arjun', // Single person link
            importance: 4,
            photoUrls: ['https://placehold.co/600x400?text=Graduation'],
            patientId: patient.id
        }
    })
    console.log('Created memories')

    console.log('✅ Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
