// Session detail endpoint
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const therapySession = await prisma.therapySession.findFirst({
            where: { id },
            include: {
                patient: true,
                memories: {
                    include: { memory: true }
                }
            }
        })

        if (!therapySession || therapySession.patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        return NextResponse.json(therapySession)
    } catch (error) {
        console.error('Get session error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        const existing = await prisma.therapySession.findFirst({
            where: { id },
            include: { patient: true }
        })

        if (!existing || existing.patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        const therapySession = await prisma.therapySession.update({
            where: { id },
            data: {
                duration: body.duration ?? existing.duration,
                mood: body.mood ?? existing.mood,
                notes: body.notes ?? existing.notes,
                completed: body.completed ?? existing.completed,
            }
        })

        return NextResponse.json(therapySession)
    } catch (error) {
        console.error('Update session error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const existing = await prisma.therapySession.findFirst({
            where: { id },
            include: { patient: true }
        })

        if (!existing || existing.patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        await prisma.therapySession.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete session error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
