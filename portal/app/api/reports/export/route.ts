// Reports Export API - Generate CSV/JSON reports
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const format = searchParams.get('format') || 'json'
        const type = searchParams.get('type') || 'sessions'

        // Get selected patient
        const cookieStore = await cookies()
        let patientId = searchParams.get('patientId') || cookieStore.get('selectedPatientId')?.value

        if (!patientId) {
            const { data: firstPatient } = await supabaseAdmin
                .from('Patient')
                .select('id')
                .eq('caregiverId', session.userId)
                .limit(1)
                .single()
            patientId = firstPatient?.id
        }

        if (!patientId) {
            return NextResponse.json({ error: 'No patient selected' }, { status: 400 })
        }

        // Verify patient belongs to caregiver
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('id', patientId)
            .eq('caregiverId', session.userId)
            .single()

        if (patientError || !patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        let data: any

        switch (type) {
            case 'sessions':
                const { data: sessionsData } = await supabaseAdmin
                    .from('TherapySession')
                    .select('*')
                    .eq('patientId', patientId)
                    .order('date', { ascending: false })

                // Get session memories for each session
                const sessionsWithMemories = await Promise.all(
                    (sessionsData || []).map(async (s) => {
                        const { data: sessionMemories } = await supabaseAdmin
                            .from('SessionMemory')
                            .select('*, memory:Memory(*)')
                            .eq('sessionId', s.id)
                        return { ...s, memories: sessionMemories || [] }
                    })
                )
                data = sessionsWithMemories
                break

            case 'memories':
                const { data: memoriesData } = await supabaseAdmin
                    .from('Memory')
                    .select('*')
                    .eq('patientId', patientId)
                    .order('date', { ascending: false })
                data = memoriesData || []
                break

            case 'progress':
                const { data: progressSessions } = await supabaseAdmin
                    .from('TherapySession')
                    .select('*')
                    .eq('patientId', patientId)
                    .order('date', { ascending: true })

                const sessionsWithSessionMemories = await Promise.all(
                    (progressSessions || []).map(async (s) => {
                        const { data: sessionMemories } = await supabaseAdmin
                            .from('SessionMemory')
                            .select('recallScore')
                            .eq('sessionId', s.id)
                        return { ...s, memories: sessionMemories || [] }
                    })
                )

                data = {
                    patient: {
                        name: patient.name,
                        age: patient.age,
                        mmseScore: patient.mmseScore,
                        diagnosis: patient.diagnosis
                    },
                    summary: {
                        totalSessions: sessionsWithSessionMemories.length,
                        totalDuration: sessionsWithSessionMemories.reduce((sum, s) => sum + s.duration, 0),
                        moodDistribution: {
                            happy: sessionsWithSessionMemories.filter(s => s.mood === 'happy').length,
                            neutral: sessionsWithSessionMemories.filter(s => s.mood === 'neutral').length,
                            sad: sessionsWithSessionMemories.filter(s => s.mood === 'sad').length,
                            confused: sessionsWithSessionMemories.filter(s => s.mood === 'confused').length,
                        }
                    },
                    sessionHistory: sessionsWithSessionMemories.map(s => ({
                        date: s.date,
                        duration: s.duration,
                        mood: s.mood,
                        memoriesReviewed: s.memories.length,
                        avgRecallScore: s.memories.length > 0
                            ? s.memories.reduce((sum: number, m: any) => sum + m.recallScore, 0) / s.memories.length
                            : null
                    }))
                }
                break

            default:
                return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
        }

        if (format === 'csv') {
            const csvData = convertToCSV(data, type)
            return new NextResponse(csvData, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${type}_report_${new Date().toISOString().split('T')[0]}.csv"`
                }
            })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Export error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Sanitize CSV values to prevent formula injection
function sanitizeCSVValue(value: any): string {
    if (value === null || value === undefined) return ''
    const str = String(value)
    // Escape values that could be interpreted as formulas in Excel
    if (/^[=+\-@\t\r]/.test(str)) {
        return `'${str}`
    }
    // Escape quotes and wrap in quotes if contains comma
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

function convertToCSV(data: any, type: string): string {
    if (type === 'sessions') {
        const headers = ['Date', 'Duration (min)', 'Mood', 'Memories Reviewed', 'Notes']
        const rows = data.map((s: any) => [
            sanitizeCSVValue(new Date(s.date).toLocaleDateString()),
            s.duration,
            sanitizeCSVValue(s.mood),
            s.memories.length,
            sanitizeCSVValue(s.notes || '')
        ])
        return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n')
    }

    if (type === 'memories') {
        const headers = ['Title', 'Date', 'Event', 'Location', 'People', 'Importance']
        const rows = data.map((m: any) => [
            sanitizeCSVValue(m.title),
            sanitizeCSVValue(new Date(m.date).toLocaleDateString()),
            sanitizeCSVValue(m.event),
            sanitizeCSVValue(m.location),
            sanitizeCSVValue(m.people),
            m.importance
        ])
        return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n')
    }

    if (type === 'progress') {
        const headers = ['Date', 'Duration (min)', 'Mood', 'Memories Reviewed', 'Avg Recall']
        const rows = data.sessionHistory.map((s: any) => [
            sanitizeCSVValue(new Date(s.date).toLocaleDateString()),
            s.duration,
            sanitizeCSVValue(s.mood),
            s.memoriesReviewed,
            s.avgRecallScore?.toFixed(1) || 'N/A'
        ])
        return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n')
    }

    return JSON.stringify(data)
}
