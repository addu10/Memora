// Patient Briefing API — Comprehensive read-only snapshot for the receiving caregiver
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET /api/transfers/[id]/briefing — Get full patient briefing data
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // --- Fetch the transfer ---
        const { data: transfer, error: fetchError } = await supabaseAdmin
            .from('PatientTransfer')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !transfer) {
            return NextResponse.json(
                { error: 'Transfer not found' },
                { status: 404 }
            )
        }

        // --- Security: Only the receiver can view the briefing ---
        // Allow for both pending (preview) and recently accepted (onboarding)
        if (transfer.toCaregiverId !== session.userId) {
            return NextResponse.json(
                { error: 'Only the receiving caregiver can view this briefing' },
                { status: 403 }
            )
        }

        // Only allow briefing for pending or accepted transfers
        if (!['pending', 'accepted'].includes(transfer.status)) {
            return NextResponse.json(
                { error: `Briefing is not available for ${transfer.status} transfers` },
                { status: 403 }
            )
        }

        // --- Fetch comprehensive patient data ---
        const patientId = transfer.patientId

        // 1. Patient Profile
        const { data: patient } = await supabaseAdmin
            .from('Patient')
            .select('id, name, age, diagnosis, mmseScore, notes, photoUrl, createdAt')
            .eq('id', patientId)
            .single()

        if (!patient) {
            return NextResponse.json(
                { error: 'Patient data no longer available' },
                { status: 404 }
            )
        }

        // 2. Sender info
        const { data: sender } = await supabaseAdmin
            .from('Caregiver')
            .select('name, email')
            .eq('id', transfer.fromCaregiverId)
            .single()

        // 3. All Memories with Photos
        const { data: memories } = await supabaseAdmin
            .from('Memory')
            .select('id, title, description, date, importance, event, location')
            .eq('patientId', patientId)
            .order('importance', { ascending: false })

        // 4. Memory Photos (for all memories)
        const memoryIds = (memories || []).map(m => m.id)
        let memoryPhotos: any[] = []
        if (memoryIds.length > 0) {
            const { data: photos } = await supabaseAdmin
                .from('MemoryPhoto')
                .select('id, memoryId, photoUrl, description, photoIndex')
                .in('memoryId', memoryIds)
                .order('photoIndex', { ascending: true })
            memoryPhotos = photos || []
        }

        // 5. Family Members
        const { data: familyMembers } = await supabaseAdmin
            .from('FamilyMember')
            .select('id, name, relationship, photoUrls, notes')
            .eq('patientId', patientId)
            .order('name', { ascending: true })

        // 6. Therapy Sessions with reviewed memories
        const { data: sessions } = await supabaseAdmin
            .from('TherapySession')
            .select('id, date, duration, mood, notes, completed')
            .eq('patientId', patientId)
            .order('date', { ascending: false })

        // 7. Session Memory details for recall scores
        const sessionIds = (sessions || []).map(s => s.id)
        let sessionMemories: any[] = []
        if (sessionIds.length > 0) {
            const { data: sm } = await supabaseAdmin
                .from('SessionMemory')
                .select('id, sessionId, recallScore')
                .in('sessionId', sessionIds)
            sessionMemories = sm || []
        }

        // --- Compute Progress Insights ---
        const totalSessions = (sessions || []).length
        const completedSessions = (sessions || []).filter(s => s.completed).length

        const moodCounts: Record<string, number> = {}
            ; (sessions || []).forEach(s => {
                moodCounts[s.mood] = (moodCounts[s.mood] || 0) + 1
            })

        const avgDuration = totalSessions > 0
            ? Math.round((sessions || []).reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions)
            : 0

        const avgRecallScore = sessionMemories.length > 0
            ? Math.round(sessionMemories.reduce((sum, sm) => sum + (sm.recallScore || 0), 0) / sessionMemories.length * 10) / 10
            : 0

        // Group photos by memory for easy client rendering
        const memoriesWithPhotos = (memories || []).map(memory => ({
            id: memory.id,
            title: memory.title,
            description: memory.description,
            date: memory.date,
            importance: memory.importance,
            event: memory.event,
            location: memory.location,
            photos: memoryPhotos
                .filter(p => p.memoryId === memory.id)
                .map(p => ({ id: p.id, photoUrl: p.photoUrl, description: p.description, photoIndex: p.photoIndex })),
        }))

        return NextResponse.json({
            transfer: {
                id: transfer.id,
                status: transfer.status,
                message: transfer.message,
                createdAt: transfer.createdAt,
                expiresAt: transfer.expiresAt,
            },
            sender: sender ? {
                name: sender.name,
                email: sender.email,
            } : null,
            patient: {
                name: patient.name,
                age: patient.age,
                diagnosis: patient.diagnosis,
                mmseScore: patient.mmseScore,
                notes: patient.notes,
                photoUrl: patient.photoUrl,
                createdAt: patient.createdAt,
            },
            memories: memoriesWithPhotos,
            familyMembers: familyMembers || [],
            sessions: (sessions || []).map(s => ({
                id: s.id,
                date: s.date,
                duration: s.duration,
                mood: s.mood,
                notes: s.notes,
                completed: s.completed,
                memoriesReviewed: sessionMemories.filter(sm => sm.sessionId === s.id).length,
                avgRecallScore: (() => {
                    const sms = sessionMemories.filter(sm => sm.sessionId === s.id)
                    return sms.length > 0
                        ? Math.round(sms.reduce((sum, sm) => sum + (sm.recallScore || 0), 0) / sms.length * 10) / 10
                        : 0
                })(),
            })),
            insights: {
                totalSessions,
                completedSessions,
                avgDuration,
                avgRecallScore,
                totalMemories: (memories || []).length,
                totalFamilyMembers: (familyMembers || []).length,
                moodDistribution: moodCounts,
                highImportanceMemories: (memories || []).filter(m => m.importance >= 4).length,
            },
        })

    } catch (error) {
        console.error('Briefing fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
