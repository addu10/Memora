// Sessions API Routes
import { NextResponse } from 'next/server'
import { supabaseAdmin, generateId, now } from '@/lib/supabase'
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
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('Patient')
            .select('id')
            .eq('id', patientId)
            .eq('caregiverId', session.userId)
            .single()

        if (patientError || !patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // Get sessions
        const { data: sessions, error: sessionsError } = await supabaseAdmin
            .from('TherapySession')
            .select('*')
            .eq('patientId', patientId)
            .order('date', { ascending: false })

        if (sessionsError) throw sessionsError

        // Get session memories for each session
        const sessionsWithMemories = await Promise.all(
            (sessions || []).map(async (therapySession) => {
                const { data: sessionMemories } = await supabaseAdmin
                    .from('SessionMemory')
                    .select('*, memory:Memory(*)')
                    .eq('sessionId', therapySession.id)

                return {
                    ...therapySession,
                    memories: sessionMemories || []
                }
            })
        )

        return NextResponse.json(sessionsWithMemories)
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
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('Patient')
            .select('id')
            .eq('id', patientId)
            .eq('caregiverId', session.userId)
            .single()

        if (patientError || !patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // Create therapy session
        const sessionId = generateId()
        const { data: therapySession, error: createError } = await supabaseAdmin
            .from('TherapySession')
            .insert({
                id: sessionId,
                duration,
                mood,
                notes: notes || null,
                completed: true,
                patientId,
                caregiverId: session.userId,
                updatedAt: now()
            })
            .select()
            .single()

        if (createError) throw createError

        // Create session memories if provided
        if (memories && memories.length > 0) {
            // SECURITY: Verify all memoryIds belong to this patient
            const memoryIds = memories.map((m: any) => m.memoryId)
            const { data: validMemories, error: verifyError } = await supabaseAdmin
                .from('Memory')
                .select('id')
                .in('id', memoryIds)
                .eq('patientId', patientId)

            if (verifyError || !validMemories || validMemories.length !== memoryIds.length) {
                return NextResponse.json({ error: 'One or more memory IDs are invalid for this patient' }, { status: 400 })
            }

            const sessionMemoriesData = memories.map((m: any) => ({
                id: generateId(),
                sessionId,
                memoryId: m.memoryId,
                recallScore: m.recallScore,
                response: m.response || null,
                promptsUsed: JSON.stringify(m.promptsUsed || [])
            }))

            await supabaseAdmin.from('SessionMemory').insert(sessionMemoriesData)
        }

        // Fetch with memories for response
        const { data: sessionMemories } = await supabaseAdmin
            .from('SessionMemory')
            .select('*, memory:Memory(*)')
            .eq('sessionId', sessionId)

        return NextResponse.json({
            ...therapySession,
            memories: sessionMemories || []
        }, { status: 201 })
    } catch (error) {
        console.error('Create session error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
