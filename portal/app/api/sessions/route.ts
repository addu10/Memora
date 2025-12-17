// Sessions API Routes
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - List all therapy sessions for a patient
export async function GET(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const patientId = searchParams.get('patientId')

        if (!patientId) {
            return NextResponse.json({ error: 'Patient ID required' }, { status: 400 })
        }

        // Verify patient belongs to caregiver
        const patient = await prisma.patient.findFirst({
            where: { id: patientId, caregiverId: session.userId }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        const sessions = await prisma.therapySession.findMany({
            where: { patientId },
            include: {
                memories: {
                    include: {
                        memory: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        })

        return NextResponse.json(sessions)
    } catch (error) {
        console.error('Get sessions error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create a new therapy session
export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { patientId, duration, mood, notes, memories } = await request.json()

        if (!patientId || !duration || !mood) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify patient belongs to caregiver
        const patient = await prisma.patient.findFirst({
            where: { id: patientId, caregiverId: session.userId }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        const therapySession = await prisma.therapySession.create({
            data: {
                duration,
                mood,
                notes,
                completed: true,
                patientId,
                caregiverId: session.userId,
                memories: memories ? {
                    create: memories.map((m: any) => ({
                        memoryId: m.memoryId,
                        recallScore: m.recallScore,
                        response: m.response,
                        promptsUsed: JSON.stringify(m.promptsUsed || [])
                    }))
                } : undefined
            },
            include: {
                memories: {
                    include: { memory: true }
                }
            }
        })

        return NextResponse.json(therapySession, { status: 201 })
    } catch (error) {
        console.error('Create session error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
