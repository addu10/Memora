// Sessions Page - View all therapy sessions
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

async function getSessions(patientId: string) {
    return prisma.therapySession.findMany({
        where: { patientId },
        include: {
            memories: {
                include: { memory: true }
            }
        },
        orderBy: { date: 'desc' }
    })
}

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

    const sessions = await getSessions(patient.id)

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
                                    <span className="session-mood">{getMoodEmoji(s.mood)}</span>
                                    <span className="session-duration">{s.duration} min</span>
                                </div>
                                <div className="session-stats-row">
                                    <span>📸 {s.memories.length} memories</span>
                                    <span>⭐ Avg recall: {getAvgRecallScore(s.memories)}/5</span>
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
                    <div className="empty-icon">📅</div>
                    <h2 className="empty-title">No Sessions Yet</h2>
                    <p className="empty-text">
                        Sessions will appear here after completing therapy on the mobile app.
                    </p>
                </div>
            )}
        </div>
    )
}
