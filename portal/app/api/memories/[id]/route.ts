// PUT endpoint for updating memories
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

        const memory = await prisma.memory.findFirst({
            where: { id },
            include: { patient: true }
        })

        if (!memory || memory.patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
        }

        return NextResponse.json(memory)
    } catch (error) {
        console.error('Get memory error:', error)
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

        // Verify memory belongs to caregiver's patient
        const existing = await prisma.memory.findFirst({
            where: { id },
            include: { patient: true }
        })

        if (!existing || existing.patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
        }

        const memory = await prisma.memory.update({
            where: { id },
            data: {
                title: body.title ?? existing.title,
                description: body.description ?? existing.description,
                photoUrl: body.photoUrl ?? existing.photoUrl,
                date: body.date ? new Date(body.date) : existing.date,
                event: body.event ?? existing.event,
                location: body.location ?? existing.location,
                people: body.people ?? existing.people,
                importance: body.importance ?? existing.importance,
            }
        })

        return NextResponse.json(memory)
    } catch (error) {
        console.error('Update memory error:', error)
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

        // Verify memory belongs to caregiver's patient
        const existing = await prisma.memory.findFirst({
            where: { id },
            include: { patient: true }
        })

        if (!existing || existing.patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
        }

        await prisma.memory.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete memory error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
