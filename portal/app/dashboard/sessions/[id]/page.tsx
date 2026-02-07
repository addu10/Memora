// Session Detail Page
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect, notFound } from 'next/navigation'

export default async function SessionDetailPage({
    params
}: {
    params: { id: string }
}) {
    const session = await getSession()
    if (!session) redirect('/login')

    const { id } = await params

    // Get therapy session
    const { data: therapySession, error } = await supabaseAdmin
        .from('TherapySession')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !therapySession) {
        notFound()
    }

    // Get patient to verify ownership
    const { data: patient } = await supabaseAdmin
        .from('Patient')
        .select('*')
        .eq('id', therapySession.patientId)
        .single()

    if (!patient || patient.caregiverId !== session.userId) {
        notFound()
    }

    // Get session memories with their full memory details
    const { data: sessionMemoriesRaw } = await supabaseAdmin
        .from('SessionMemory')
        .select('*')
        .eq('sessionId', id)

    const sessionMemories = await Promise.all(
        (sessionMemoriesRaw || []).map(async (sm) => {
            const { data: memory } = await supabaseAdmin
                .from('Memory')
                .select('*')
                .eq('id', sm.memoryId)
                .single()
            return { ...sm, memory: memory || {} }
        })
    )

    const moodColor = {
        happy: '#10b981',
        neutral: '#6b7280',
        sad: '#3b82f6',
        confused: '#f59e0b'
    }[therapySession.mood] || '#6b7280'

    const avgRecall = sessionMemories.length > 0
        ? (sessionMemories.reduce((sum, m) => sum + m.recallScore, 0) / sessionMemories.length).toFixed(1)
        : '--'

    return (
        <div className="session-detail-page">
            <div className="page-header">
                <Link href="/dashboard/sessions" className="back-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                    </svg> Back to Sessions
                </Link>
            </div>

            {/* Session Overview Card */}
            <div className="session-overview-card">
                <div className="session-date-big">
                    <div className="date-day">{new Date(therapySession.date).getDate()}</div>
                    <div className="date-month">{new Date(therapySession.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div>
                </div>
                <div className="session-overview-details">
                    <h1 className="session-overview-title">
                        Therapy Session with {patient.name}
                    </h1>
                    <div className="session-overview-meta">
                        <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: moodColor }} />
                            {therapySession.mood}
                        </span>
                        <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            {therapySession.duration}m
                        </span>
                        <span className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            Recall: {avgRecall}/5
                        </span>
                    </div>
                </div>
            </div>

            {/* Session Stats */}
            <div className="stats-row">
                <div className="stat-card-detail">
                    <div className="stat-icon-3d-sm">
                        <img src="/icons/memories.png" alt="" className="stat-icon-img-sm" />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{sessionMemories.length}</div>
                        <div className="stat-label">Reviewed</div>
                    </div>
                </div>
                <div className="stat-card-detail">
                    <div className="stat-icon-3d-sm">
                        <img src="/icons/analytics.png" alt="" className="stat-icon-img-sm" />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{avgRecall}</div>
                        <div className="stat-label">Avg Recall</div>
                    </div>
                </div>
                <div className="stat-card-detail">
                    <div className="stat-icon-3d-sm" style={{ background: '#f0fdf4' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: moodColor, border: '2px solid white' }} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value capitalize">{therapySession.mood}</div>
                        <div className="stat-label">Mood</div>
                    </div>
                </div>
            </div>

            {/* Memories Reviewed */}
            <div className="section-card">
                <h2 className="section-title">Memories Reviewed</h2>
                {sessionMemories.length > 0 ? (
                    <div className="memory-review-list">
                        {sessionMemories.map((sm: any) => (
                            <div key={sm.id} className="memory-review-item">
                                <div className="memory-review-image">
                                    {sm.memory.photoUrl ? (
                                        <img src={sm.memory.photoUrl} alt={sm.memory.title} />
                                    ) : (
                                        <div className="memory-placeholder-3d">
                                            <img src="/icons/memories.png" alt="" className="logo-icon-sm" />
                                        </div>
                                    )}
                                </div>
                                <div className="memory-review-info">
                                    <div className="memory-review-title">{sm.memory.title}</div>
                                    <div className="memory-review-meta">
                                        {sm.memory.event} • {sm.memory.location}
                                    </div>
                                    {sm.response && (
                                        <div className="memory-review-response">
                                            "{sm.response}"
                                        </div>
                                    )}
                                </div>
                                <div className="memory-review-score">
                                    <div className="score-value">{sm.recallScore}</div>
                                    <div className="score-label">/ 5</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="empty-text-small">No memories were reviewed in this session</p>
                )}
            </div>

            {/* Notes */}
            {therapySession.notes && (
                <div className="section-card">
                    <h2 className="section-title">Session Notes</h2>
                    <p className="session-notes-text">{therapySession.notes}</p>
                </div>
            )}
        </div>
    )
}
