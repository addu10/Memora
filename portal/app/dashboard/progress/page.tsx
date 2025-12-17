// Progress Page - Analytics and Charts
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

async function getProgressData(patientId: string) {
    const sessions = await prisma.therapySession.findMany({
        where: { patientId },
        include: {
            memories: true
        },
        orderBy: { date: 'asc' }
    })

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
            ? s.memories.reduce((sum, m) => sum + m.recallScore, 0) / s.memories.length
            : 0
        return {
            date: s.date,
            avgRecall: avgRecall.toFixed(1),
            mood: s.mood
        }
    })

    // Overall average recall
    const allRecalls = sessions.flatMap(s => s.memories.map(m => m.recallScore))
    const avgRecall = allRecalls.length > 0
        ? (allRecalls.reduce((a, b) => a + b, 0) / allRecalls.length).toFixed(1)
        : '0'

    return {
        totalSessions,
        totalDuration,
        moodCounts,
        recallOverTime,
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
        patient = await prisma.patient.findFirst({
            where: { id: patientId, caregiverId: session.userId }
        })
    }

    if (!patient) {
        const firstPatient = await prisma.patient.findFirst({
            where: { caregiverId: session.userId }
        })
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

    const progress = await getProgressData(patient.id)

    return (
        <div className="progress-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Progress</h1>
                    <p className="page-subtitle">Therapy progress for {patient.name}</p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-value">{progress.totalSessions}</div>
                    <div className="stat-label">Total Sessions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-value">{progress.totalDuration}</div>
                    <div className="stat-label">Minutes of Therapy</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-value">{progress.avgRecall}</div>
                    <div className="stat-label">Avg. Recall Score</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">😊</div>
                    <div className="stat-value">{progress.moodCounts.happy}</div>
                    <div className="stat-label">Happy Sessions</div>
                </div>
            </div>

            {/* Mood Distribution */}
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title">Mood Distribution</h2>
                </div>
                <div className="section-body">
                    <div className="mood-bars">
                        <div className="mood-bar-item">
                            <span className="mood-label">😊 Happy</span>
                            <div className="mood-bar">
                                <div
                                    className="mood-bar-fill happy"
                                    style={{ width: `${(progress.moodCounts.happy / Math.max(progress.totalSessions, 1)) * 100}%` }}
                                />
                            </div>
                            <span className="mood-count">{progress.moodCounts.happy}</span>
                        </div>
                        <div className="mood-bar-item">
                            <span className="mood-label">😐 Neutral</span>
                            <div className="mood-bar">
                                <div
                                    className="mood-bar-fill neutral"
                                    style={{ width: `${(progress.moodCounts.neutral / Math.max(progress.totalSessions, 1)) * 100}%` }}
                                />
                            </div>
                            <span className="mood-count">{progress.moodCounts.neutral}</span>
                        </div>
                        <div className="mood-bar-item">
                            <span className="mood-label">😢 Sad</span>
                            <div className="mood-bar">
                                <div
                                    className="mood-bar-fill sad"
                                    style={{ width: `${(progress.moodCounts.sad / Math.max(progress.totalSessions, 1)) * 100}%` }}
                                />
                            </div>
                            <span className="mood-count">{progress.moodCounts.sad}</span>
                        </div>
                        <div className="mood-bar-item">
                            <span className="mood-label">😕 Confused</span>
                            <div className="mood-bar">
                                <div
                                    className="mood-bar-fill confused"
                                    style={{ width: `${(progress.moodCounts.confused / Math.max(progress.totalSessions, 1)) * 100}%` }}
                                />
                            </div>
                            <span className="mood-count">{progress.moodCounts.confused}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recall Progress */}
            {progress.recallOverTime.length > 0 && (
                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">Recall Score Over Time</h2>
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
        </div>
    )
}
