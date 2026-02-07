import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin, now } from '@/lib/supabase'

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
        const { id } = await params

        const { data: member, error } = await supabaseAdmin
            .from('FamilyMember')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !member) {
            return NextResponse.json({ error: 'Family member not found' }, { status: 404 })
        }

        // Verify ownership via patient
        const { data: patient } = await supabaseAdmin
            .from('Patient')
            .select('caregiverId')
            .eq('id', member.patientId)
            .single()

        if (!patient || patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        return NextResponse.json({ ...member, patient })
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
        const { id } = await params
        const body = await request.json()
        const { name, relationship, photoUrls, notes } = body

        if (!name || !relationship) {
            return NextResponse.json(
                { error: 'Name and relationship are required' },
                { status: 400 }
            )
        }

        // Get existing member
        const { data: existingMember, error: findError } = await supabaseAdmin
            .from('FamilyMember')
            .select('*')
            .eq('id', id)
            .single()

        if (findError || !existingMember) {
            return NextResponse.json({ error: 'Family member not found' }, { status: 404 })
        }

        // Verify ownership via patient
        const { data: patient } = await supabaseAdmin
            .from('Patient')
            .select('caregiverId')
            .eq('id', existingMember.patientId)
            .single()

        if (!patient || patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { data: updatedMember, error: updateError } = await supabaseAdmin
            .from('FamilyMember')
            .update({
                name,
                relationship,
                photoUrls: photoUrls ?? existingMember.photoUrls,
                notes: notes ?? existingMember.notes,
                updatedAt: now()
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) throw updateError

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
        const { id } = await params

        // Get existing member
        const { data: existingMember, error: findError } = await supabaseAdmin
            .from('FamilyMember')
            .select('patientId')
            .eq('id', id)
            .single()

        if (findError || !existingMember) {
            return NextResponse.json({ error: 'Family member not found' }, { status: 404 })
        }

        // Verify ownership via patient
        const { data: patient } = await supabaseAdmin
            .from('Patient')
            .select('caregiverId')
            .eq('id', existingMember.patientId)
            .single()

        if (!patient || patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { error: deleteError } = await supabaseAdmin
            .from('FamilyMember')
            .delete()
            .eq('id', id)

        if (deleteError) throw deleteError

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete family member' },
            { status: 500 }
        )
    }
}
