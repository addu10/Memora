// Patient Stats API - for mobile dashboard
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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

        // Verify patient belongs to caregiver
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('Patient')
            .select('id')
            .eq('id', id)
            .eq('caregiverId', session.userId)
            .single()

        if (patientError || !patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // Get counts in parallel
        const [sessionCountResult, memoryCountResult, familyCountResult, sessionsResult] = await Promise.all([
            supabaseAdmin.from('TherapySession').select('id', { count: 'exact', head: true }).eq('patientId', id),
            supabaseAdmin.from('Memory').select('id', { count: 'exact', head: true }).eq('patientId', id),
            supabaseAdmin.from('FamilyMember').select('id', { count: 'exact', head: true }).eq('patientId', id),
            supabaseAdmin
                .from('TherapySession')
                .select('id')
                .eq('patientId', id)
                .order('date', { ascending: false })
                .limit(10)
        ])

        // Get session memories for average recall calculation
        const sessionIds = (sessionsResult.data || []).map(s => s.id)
        let totalRecall = 0
        let recallCount = 0

        if (sessionIds.length > 0) {
            const { data: sessionMemories } = await supabaseAdmin
                .from('SessionMemory')
                .select('recallScore')
                .in('sessionId', sessionIds)

            if (sessionMemories) {
                sessionMemories.forEach(m => {
                    totalRecall += m.recallScore
                    recallCount++
                })
            }
        }

        const averageRecall = recallCount > 0 ? totalRecall / recallCount : null

        return NextResponse.json({
            sessionCount: sessionCountResult.count || 0,
            memoryCount: memoryCountResult.count || 0,
            familyCount: familyCountResult.count || 0,
            averageRecall
        })
    } catch (error) {
        console.error('Get patient stats error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
