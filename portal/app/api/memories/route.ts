import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'

// POST /api/memories - Create a new memory
export async function POST(request: Request) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { title, description, photoUrls, date, event, location, people, importance, patientId } = body

        if (!title || !date || !event || !location || !people || !photoUrls || photoUrls.length === 0 || !patientId) {
            return NextResponse.json(
                { error: 'Missing required fields (including patient selection)' },
                { status: 400 }
            )
        }

        // Verify the caregiver's patient.
        const patient = await prisma.patient.findFirst({
            where: {
                id: patientId,
                caregiverId: session.userId
            }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Invalid patient selected' }, { status: 404 })
        }

        const memory = await prisma.memory.create({
            data: {
                title,
                description,
                photoUrls,
                date: new Date(date),
                event,
                location,
                people,
                importance: parseInt(importance),
                patientId: patient.id
            }
        })

        return NextResponse.json(memory)
    } catch (error) {
        console.error('Create memory error:', error)
        return NextResponse.json(
            { error: 'Failed to create memory' },
            { status: 500 }
        )
    }
}

// GET /api/memories?patientId=xyz&search=Name
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const searchQuery = searchParams.get('search')

    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Handler with optional patientId (defaults to first patient) + search
    let targetPatientId = patientId

    if (!targetPatientId) {
        const firstPatient = await prisma.patient.findFirst({
            where: { caregiverId: session.userId }
        })
        if (firstPatient) targetPatientId = firstPatient.id
    }

    if (!targetPatientId) {
        // No patient found for this caregiver at all
        return NextResponse.json([])
    }

    // Verify ownership of the target patient
    const patient = await prisma.patient.findFirst({
        where: { id: targetPatientId, caregiverId: session.userId }
    })

    if (!patient) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    // Build query
    const whereClause: any = { patientId: targetPatientId }

    // Add search filter if present (Facial Recognition Hook)
    // Searches 'people' field which is now comma-separated string of linked names
    if (searchQuery) {
        whereClause.people = {
            contains: searchQuery,
            mode: 'insensitive'
        }
    }

    const memories = await prisma.memory.findMany({
        where: whereClause,
        orderBy: { date: 'desc' }
    })
    return NextResponse.json(memories)
}
