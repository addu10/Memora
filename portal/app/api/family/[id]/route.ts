import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/family/[id] - Get family member details
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const member = await prisma.familyMember.findUnique({
            where: { id: params.id },
            include: { patient: true }
        })

        if (!member) {
            return NextResponse.json({ error: 'Family member not found' }, { status: 404 })
        }

        // Verify ownership (the patient belongs to this caregiver)
        if (member.patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        return NextResponse.json(member)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch family member' },
            { status: 500 }
        )
    }
}

// PUT /api/family/[id] - Update family member
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, relationship, photoUrls, notes } = body

        if (!name || !relationship) {
            return NextResponse.json(
                { error: 'Name and relationship are required' },
                { status: 400 }
            )
        }

        // Verify ownership before update
        const existingMember = await prisma.familyMember.findUnique({
            where: { id: params.id },
            include: { patient: true }
        })

        if (!existingMember) {
            return NextResponse.json({ error: 'Family member not found' }, { status: 404 })
        }

        if (existingMember.patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const updatedMember = await prisma.familyMember.update({
            where: { id: params.id },
            data: {
                name,
                relationship,
                photoUrls: photoUrls,
                notes
            }
        })

        return NextResponse.json(updatedMember)
    } catch (error) {
        console.error('Update family member error:', error)
        return NextResponse.json(
            { error: 'Failed to update family member' },
            { status: 500 }
        )
    }
}

// DELETE /api/family/[id] - Delete family member
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const existingMember = await prisma.familyMember.findUnique({
            where: { id: params.id },
            include: { patient: true }
        })

        if (!existingMember) {
            return NextResponse.json({ error: 'Family member not found' }, { status: 404 })
        }

        if (existingMember.patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        await prisma.familyMember.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete family member' },
            { status: 500 }
        )
    }
}
