// Sessions Page - View all therapy sessions
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'

function getMoodEmoji(mood: string) {
    switch (mood) {
        case 'happy': return '😊'
        case 'neutral': return '😐'
        case 'sad': return '😢'
        case 'confused': return '😕'
        default: return '🙂'
    }
}

function getAvgRecallScore(memories: any[]) {
    if (memories.length === 0) return 0
    const total = memories.reduce((sum, m) => sum + m.recallScore, 0)
    return (total / memories.length).toFixed(1)
}

export default async function SessionsPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const cookieStore = await cookies()
    const patientId = cookieStore.get('selectedPatientId')?.value

    let patient = null
    if (patientId) {
        const { data } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('id', patientId)
            .eq('caregiverId', session.userId)
            .single()
        patient = data
    }

    if (!patient) {
        const { data: firstPatient } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('caregiverId', session.userId)
            .limit(1)
            .single()

        if (!firstPatient) {
            return (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h2 className="empty-title">No Patient Added Yet</h2>
                    <Link href="/dashboard/patients/new" className="btn btn-primary">Add Patient</Link>
                </div>
            )
        }
        patient = firstPatient
    }

    // Get sessions for patient
    const { data: sessionsRaw } = await supabaseAdmin
        .from('TherapySession')
        .select('*')
        .eq('patientId', patient.id)
        .order('date', { ascending: false })

    // Get session memories for each session
    const sessions = await Promise.all(
        (sessionsRaw || []).map(async (s) => {
            const { data: sessionMemories } = await supabaseAdmin
                .from('SessionMemory')
                .select('*')
                .eq('sessionId', s.id)
            return { ...s, memories: sessionMemories || [] }
        })
    )

    return (
        <div className="sessions-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Therapy Sessions</h1>
                    <p className="page-subtitle">Session history for {patient.name}</p>
                </div>
            </div>

            {sessions.length > 0 ? (
                <div className="sessions-list">
                    {sessions.map(s => (
                        <Link key={s.id} href={`/dashboard/sessions/${s.id}`} className="session-card">
                            <div className="session-date-col">
                                <div className="session-day">
                                    {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric' })}
                                </div>
                                <div className="session-month">
                                    {new Date(s.date).toLocaleDateString('en-IN', { month: 'short' })}
                                </div>
                            </div>
                            <div className="session-details">
                                <div className="session-header-row">
                                    <span className="session-mood-badge">{s.mood}</span>
                                    <span className="session-duration">{s.duration} min</span>
                                </div>
                                <div className="session-stats-row">
                                    <span className="stat-pill"><strong>{s.memories.length}</strong> Memories</span>
                                    <span className="stat-pill"><strong>{getAvgRecallScore(s.memories)}</strong> Recall</span>
                                </div>
                                {s.notes && (
                                    <p className="session-notes">{s.notes}</p>
                                )}
                            </div>
                            <div className="session-arrow">→</div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon-3d">
                        <img src="/icons/sessions.png" alt="" className="empty-img" />
                    </div>
                    <h2 className="empty-title">No Sessions Yet</h2>
                    <p className="empty-text">
                        Sessions will appear here after completing therapy on the mobile app.
                    </p>
                </div>
            )}
        </div>
    )
}
