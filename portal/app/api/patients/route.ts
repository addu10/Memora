// Patients API Routes
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/patients - List all patients
export async function GET() {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const patients = await prisma.patient.findMany({
            where: { caregiverId: session.userId },
            include: {
                _count: {
                    select: { sessions: true, memories: true, familyMembers: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        })

        return NextResponse.json({ patients })

    } catch (error) {
        console.error('Get patients error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/patients - Create a new patient
export async function POST(request: Request) {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, age, mmseScore, diagnosis, notes, photoUrl, pin } = body

        if (!name || !age) {
            return NextResponse.json(
                { error: 'Name and age are required' },
                { status: 400 }
            )
        }

        const patient = await prisma.patient.create({
            data: {
                name,
                age: parseInt(age),
                mmseScore: mmseScore ? parseInt(mmseScore) : null,
                diagnosis,
                notes,
                photoUrl,
                // @ts-ignore
                pin: pin || "0000",
                caregiverId: session.userId
            }
        })

        return NextResponse.json({ patient }, { status: 201 })

    } catch (error) {
        console.error('Create patient error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
