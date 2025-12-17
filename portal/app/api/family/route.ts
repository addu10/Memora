import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/family - List family members for current patient
export async function GET(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Find the current active patient for this caregiver.
    // Ideally we should pass patientId in query param, or check cookie, 
    // but for the dropdown we usually want the "current" context.
    // Let's rely on finding the first patient for now if not specified 
    // (matching the behavior of other simple fetches).

    // In a robust app we'd parse the cookie here or require a param.
    // Let's try to grab all family members for *any* of the caregiver's patients? 
    // No, names might duplicate. Let's find the most recently updated patient or just the first.

    const patient = await prisma.patient.findFirst({
        where: { caregiverId: session.userId }
    })

    if (!patient) {
        return NextResponse.json([])
    }

    const familyMembers = await prisma.familyMember.findMany({
        where: { patientId: patient.id },
        select: { id: true, name: true, relationship: true },
        orderBy: { name: 'asc' }
    })

    return NextResponse.json(familyMembers)
}

// POST /api/family - Create a new family member
export async function POST(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()
        const { name, relationship, photoUrls, notes, patientId } = body

        if (!name || !relationship || !patientId) {
            return NextResponse.json({ error: 'Name, relationship, and patientId are required' }, { status: 400 })
        }

        // Verify the patient belongs to the caregiver
        const patient = await prisma.patient.findFirst({
            where: {
                id: patientId,
                caregiverId: session.userId
            }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Invalid patient selected' }, { status: 404 })
        }

        const newMember = await prisma.familyMember.create({
            data: {
                name,
                relationship,
                photoUrls: photoUrls || [],
                notes,
                patientId: patient.id
            }
        })

        return NextResponse.json(newMember, { status: 201 })
    } catch (error) {
        console.error('Error creating family member:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
