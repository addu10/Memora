// Progress Page - Analytics and Charts
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getProgressData(patientId: string) {
    // Get sessions for patient
    const { data: sessionsRaw } = await supabaseAdmin
        .from('TherapySession')
        .select('*')
        .eq('patientId', patientId)
        .order('date', { ascending: true })

    // Get all session memories for this patient's sessions
    const { data: allSessionMemories } = await supabaseAdmin
        .from('SessionMemory')
        .select(`
            *,
            Memory (
                title,
                event
            )
        `)
        .in('sessionId', (sessionsRaw || []).map(s => s.id))

    const sessions = (sessionsRaw || []).map(s => ({
        ...s,
        memories: (allSessionMemories || []).filter(sm => sm.sessionId === s.id)
    }))

    const totalSessions = sessions.length
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)

    // Calculate mood distribution
    const moodCounts: Record<string, number> = { happy: 0, neutral: 0, sad: 0, confused: 0 }
    sessions.forEach(s => {
        if (moodCounts[s.mood] !== undefined) moodCounts[s.mood]++
    })

    // Calculate average recall scores over time
    const recallOverTime = sessions.map(s => {
        const avgRecall = s.memories.length > 0
            ? s.memories.reduce((sum: number, m: any) => sum + m.recallScore, 0) / s.memories.length
            : 0
        return {
            date: s.date,
            avgRecall: avgRecall.toFixed(1),
            mood: s.mood
        }
    })

    // Memory-level statistics
    const memoryStatsMap: Record<string, { title: string, event: string, totalScore: number, count: number }> = {}

        ; (allSessionMemories || []).forEach((sm: any) => {
            const memoryId = sm.memoryId
            if (!memoryStatsMap[memoryId]) {
                memoryStatsMap[memoryId] = {
                    title: sm.Memory?.title || 'Unknown',
                    event: sm.Memory?.event || 'Unknown',
                    totalScore: 0,
                    count: 0
                }
            }
            memoryStatsMap[memoryId].totalScore += sm.recallScore
            memoryStatsMap[memoryId].count += 1
        })

    const memoryStats = Object.entries(memoryStatsMap).map(([id, stats]) => ({
        id,
        ...stats,
        averageRecall: (stats.totalScore / stats.count).toFixed(1)
    })).sort((a, b) => parseFloat(a.averageRecall) - parseFloat(b.averageRecall))

    // Overall average recall
    const allRecalls = (allSessionMemories || []).map(m => m.recallScore)
    const avgRecall = allRecalls.length > 0
        ? (allRecalls.reduce((a, b) => a + b, 0) / allRecalls.length).toFixed(1)
        : '0'

    return {
        totalSessions,
        totalDuration,
        moodCounts,
        recallOverTime,
        memoryStats,
        avgRecall
    }
}

export default async function ProgressPage() {
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
                    <div className="empty-icon-3d">
                        <img src="/icons/patients.png" alt="" className="empty-img" />
                    </div>
                    <h2 className="empty-title">No Patient Added Yet</h2>
                    <Link href="/dashboard/patients/new" className="btn btn-primary">Add Patient</Link>
                </div>
            )
        }
        patient = firstPatient
    }

    const progress = await getProgressData(patient.id)

    return (
        <div className="progress-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Progress Analysis</h1>
                    <p className="page-subtitle">Clinical insights for {patient.name}</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-3d">
                        <img src="/icons/sessions.png" alt="" className="stat-icon-img" />
                    </div>
                    <div className="stat-value">{progress.totalSessions}</div>
                    <div className="stat-label">Total Sessions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-3d">
                        <img src="/icons/overview.png" alt="" className="stat-icon-img" />
                    </div>
                    <div className="stat-value">{progress.totalDuration}</div>
                    <div className="stat-label">Total Minutes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-3d">
                        <img src="/icons/analytics.png" alt="" className="stat-icon-img" />
                    </div>
                    <div className="stat-value">{progress.avgRecall}</div>
                    <div className="stat-label">Avg. Recall</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-3d">
                        <img src="/icons/wellness.svg" alt="" className="stat-icon-img" />
                    </div>
                    <div className="stat-value">{progress.moodCounts.happy}</div>
                    <div className="stat-label">Positive Days</div>
                </div>
            </div>

            <div className="progress-grid">
                {/* Left Column: Charts */}
                <div className="progress-main">
                    {/* Recall Progress */}
                    {progress.recallOverTime.length > 0 && (
                        <div className="section-card">
                            <div className="section-header">
                                <h2 className="section-title">Recall Trend</h2>
                            </div>
                            <div className="section-body">
                                <div className="recall-timeline">
                                    {progress.recallOverTime.slice(-10).map((item, i) => (
                                        <div key={i} className="recall-item">
                                            <div className="recall-score-bar" style={{ height: `${(parseFloat(item.avgRecall) / 5) * 100}%` }} />
                                            <span className="recall-score">{item.avgRecall}</span>
                                            <span className="recall-date">
                                                {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Memory Performance */}
                    <div className="section-card">
                        <div className="section-header">
                            <h2 className="section-title">Memory Support Analysis</h2>
                            <p className="text-xs text-gray-500">How well the patient recalls specific events</p>
                        </div>
                        <div className="section-body">
                            {progress.memoryStats.length > 0 ? (
                                <div className="memory-stats-list">
                                    {progress.memoryStats.map((stat, i) => (
                                        <div key={i} className="memory-stat-item">
                                            <div className="memory-stat-info">
                                                <span className="memory-stat-title">{stat.title}</span>
                                                <span className="memory-stat-event">{stat.event}</span>
                                            </div>
                                            <div className="memory-stat-score">
                                                <div className="score-badge" style={{
                                                    background: parseFloat(stat.averageRecall) > 4 ? '#dcfce7' : parseFloat(stat.averageRecall) > 2 ? '#fef9c3' : '#fee2e2',
                                                    color: parseFloat(stat.averageRecall) > 4 ? '#166534' : parseFloat(stat.averageRecall) > 2 ? '#854d0e' : '#991b1b'
                                                }}>
                                                    {stat.averageRecall} / 5
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-compact">No data yet. Complete a session to see analysis.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Mood Distribution */}
                <div className="progress-side">
                    <div className="section-card">
                        <div className="section-header">
                            <h2 className="section-title">Emotional Wellbeing</h2>
                        </div>
                        <div className="section-body">
                            <div className="mood-bars">
                                {[
                                    { label: 'Happy', key: 'happy', color: 'happy' },
                                    { label: 'Neutral', key: 'neutral', color: 'neutral' },
                                    { label: 'Sad', key: 'sad', color: 'sad' },
                                    { label: 'Confused', key: 'confused', color: 'confused' }
                                ].map(m => (
                                    <div key={m.key} className="mood-bar-item">
                                        <span className="mood-label">{m.label}</span>
                                        <div className="mood-bar">
                                            <div
                                                className="mood-bar-fill"
                                                style={{
                                                    width: `${(progress.moodCounts[m.key] / Math.max(progress.totalSessions, 1)) * 100}%`,
                                                    backgroundColor: m.color === 'happy' ? '#10b981' : m.color === 'neutral' ? '#6b7280' : m.color === 'sad' ? '#3b82f6' : '#f59e0b'
                                                }}
                                            />
                                        </div>
                                        <span className="mood-count">{progress.moodCounts[m.key]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
