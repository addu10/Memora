// Session detail endpoint
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

        // Get therapy session
        const { data: therapySession, error } = await supabaseAdmin
            .from('TherapySession')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !therapySession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Verify ownership via patient
        const { data: patient } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('id', therapySession.patientId)
            .single()

        if (!patient || patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Get session memories
        const { data: sessionMemories } = await supabaseAdmin
            .from('SessionMemory')
            .select('*, memory:Memory(*)')
            .eq('sessionId', id)

        return NextResponse.json({
            ...therapySession,
            patient,
            memories: sessionMemories || []
        })
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

        // Get existing session
        const { data: existing, error: findError } = await supabaseAdmin
            .from('TherapySession')
            .select('*')
            .eq('id', id)
            .single()

        if (findError || !existing) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Verify ownership via patient
        const { data: patient } = await supabaseAdmin
            .from('Patient')
            .select('caregiverId')
            .eq('id', existing.patientId)
            .single()

        if (!patient || patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        const { data: therapySession, error: updateError } = await supabaseAdmin
            .from('TherapySession')
            .update({
                duration: body.duration ?? existing.duration,
                mood: body.mood ?? existing.mood,
                notes: body.notes ?? existing.notes,
                completed: body.completed ?? existing.completed,
                updatedAt: now()
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) throw updateError

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

        // Get existing session
        const { data: existing, error: findError } = await supabaseAdmin
            .from('TherapySession')
            .select('patientId')
            .eq('id', id)
            .single()

        if (findError || !existing) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Verify ownership via patient
        const { data: patient } = await supabaseAdmin
            .from('Patient')
            .select('caregiverId')
            .eq('id', existing.patientId)
            .single()

        if (!patient || patient.caregiverId !== session.userId) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        const { error: deleteError } = await supabaseAdmin
            .from('TherapySession')
            .delete()
            .eq('id', id)

        if (deleteError) throw deleteError

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete session error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
