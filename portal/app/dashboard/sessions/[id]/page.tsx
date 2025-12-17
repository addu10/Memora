// Session Detail Page
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect, notFound } from 'next/navigation'

async function getTherapySession(sessionId: string, userId: string) {
    return prisma.therapySession.findFirst({
        where: { id: sessionId },
        include: {
            patient: true,
            memories: {
                include: { memory: true }
            }
        }
    })
}

export default async function SessionDetailPage({
    params
}: {
    params: { id: string }
}) {
    const session = await getSession()
    if (!session) redirect('/login')

    const { id } = await params
    const therapySession = await getTherapySession(id, session.userId)

    if (!therapySession || therapySession.patient.caregiverId !== session.userId) {
        notFound()
    }

    const moodEmoji = {
        happy: '😊',
        neutral: '😐',
        sad: '😢',
        confused: '😕'
    }[therapySession.mood] || '😐'

    const avgRecall = therapySession.memories.length > 0
        ? (therapySession.memories.reduce((sum, m) => sum + m.recallScore, 0) / therapySession.memories.length).toFixed(1)
        : '--'

    return (
        <div className="session-detail-page">
            <div className="page-header">
                <Link href="/dashboard/sessions" className="back-link">
                    ← Back to Sessions
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
                        Therapy Session with {therapySession.patient.name}
                    </h1>
                    <div className="session-overview-meta">
                        <span className="meta-item">{moodEmoji} {therapySession.mood}</span>
                        <span className="meta-item">⏱️ {therapySession.duration} minutes</span>
                        <span className="meta-item">📊 Avg Recall: {avgRecall}/5</span>
                    </div>
                </div>
            </div>

            {/* Session Stats */}
            <div className="stats-row">
                <div className="stat-card-detail">
                    <div className="stat-icon">🖼️</div>
                    <div className="stat-info">
                        <div className="stat-value">{therapySession.memories.length}</div>
                        <div className="stat-label">Memories Reviewed</div>
                    </div>
                </div>
                <div className="stat-card-detail">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                        <div className="stat-value">{avgRecall}</div>
                        <div className="stat-label">Avg Recall Score</div>
                    </div>
                </div>
                <div className="stat-card-detail">
                    <div className="stat-icon">{moodEmoji}</div>
                    <div className="stat-info">
                        <div className="stat-value capitalize">{therapySession.mood}</div>
                        <div className="stat-label">Session Mood</div>
                    </div>
                </div>
            </div>

            {/* Memories Reviewed */}
            <div className="section-card">
                <h2 className="section-title">Memories Reviewed</h2>
                {therapySession.memories.length > 0 ? (
                    <div className="memory-review-list">
                        {therapySession.memories.map((sm) => (
                            <div key={sm.id} className="memory-review-item">
                                <div className="memory-review-image">
                                    {sm.memory.photoUrl ? (
                                        <img src={sm.memory.photoUrl} alt={sm.memory.title} />
                                    ) : (
                                        <span className="memory-placeholder-icon">🖼️</span>
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
