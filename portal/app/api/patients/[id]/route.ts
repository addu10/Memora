// Delete Patient API Route
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

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

        // Verify patient belongs to caregiver
        const patient = await prisma.patient.findFirst({
            where: { id, caregiverId: session.userId }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // Delete patient (cascades to memories, family members, sessions)
        await prisma.patient.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete patient error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

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

        const patient = await prisma.patient.findFirst({
            where: { id, caregiverId: session.userId },
            include: {
                memories: true,
                familyMembers: true,
                sessions: {
                    include: { memories: true }
                },
                _count: {
                    select: { sessions: true, memories: true, familyMembers: true }
                }
            }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        return NextResponse.json(patient)
    } catch (error) {
        console.error('Get patient error:', error)
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

        // Verify patient belongs to caregiver
        const existing = await prisma.patient.findFirst({
            where: { id, caregiverId: session.userId }
        })

        if (!existing) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        const patient = await prisma.patient.update({
            where: { id },
            data: {
                name: body.name ?? existing.name,
                age: body.age ?? existing.age,
                mmseScore: body.mmseScore ?? existing.mmseScore,
                diagnosis: body.diagnosis ?? existing.diagnosis,
                notes: body.notes ?? existing.notes,
                photoUrl: body.photoUrl ?? existing.photoUrl,
            }
        })

        return NextResponse.json(patient)
    } catch (error) {
        console.error('Update patient error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
