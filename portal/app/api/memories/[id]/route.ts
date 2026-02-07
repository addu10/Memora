// Memory by ID API Route
import { NextResponse } from 'next/server'
import { supabaseAdmin, now } from '@/lib/supabase'
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

        // Get memory with patient info for authorization check
        const { data: memory, error } = await supabaseAdmin
            .from('Memory')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !memory) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
        }

        // Verify ownership via patient
        const { data: patient } = await supabaseAdmin
            .from('Patient')
            .select('caregiverId')
            .eq('id', memory.patientId)
            .single()

        if (!patient || patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
        }

        return NextResponse.json({ ...memory, patient })
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

        // Get existing memory
        const { data: existing, error: findError } = await supabaseAdmin
            .from('Memory')
            .select('*')
            .eq('id', id)
            .single()

        if (findError || !existing) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
        }

        // Verify ownership via patient
        const { data: patient } = await supabaseAdmin
            .from('Patient')
            .select('caregiverId')
            .eq('id', existing.patientId)
            .single()

        if (!patient || patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
        }

        const { data: memory, error: updateError } = await supabaseAdmin
            .from('Memory')
            .update({
                title: body.title ?? existing.title,
                description: body.description ?? existing.description,
                photoUrls: body.photoUrls ?? existing.photoUrls,
                date: body.date ? new Date(body.date).toISOString() : existing.date,
                event: body.event ?? existing.event,
                location: body.location ?? existing.location,
                people: body.people ?? existing.people,
                importance: body.importance ?? existing.importance,
                updatedAt: now()
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) throw updateError

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

        // Get existing memory
        const { data: existing, error: findError } = await supabaseAdmin
            .from('Memory')
            .select('patientId')
            .eq('id', id)
            .single()

        if (findError || !existing) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
        }

        // Verify ownership via patient
        const { data: patient } = await supabaseAdmin
            .from('Patient')
            .select('caregiverId')
            .eq('id', existing.patientId)
            .single()

        if (!patient || patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Memory not found' }, { status: 404 })
        }

        const { error: deleteError } = await supabaseAdmin
            .from('Memory')
            .delete()
            .eq('id', id)

        if (deleteError) throw deleteError

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete memory error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
