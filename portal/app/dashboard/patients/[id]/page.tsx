// Patient Detail Page
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect, notFound } from 'next/navigation'

async function getPatient(patientId: string, userId: string) {
    return prisma.patient.findFirst({
        where: { id: patientId, caregiverId: userId },
        include: {
            memories: {
                orderBy: { date: 'desc' },
                take: 5
            },
            familyMembers: true,
            sessions: {
                orderBy: { date: 'desc' },
                take: 5,
                include: {
                    memories: true
                }
            },
            _count: {
                select: { sessions: true, memories: true, familyMembers: true }
            }
        }
    })
}

export default async function PatientDetailPage({
    params
}: {
    params: { id: string }
}) {
    const session = await getSession()
    if (!session) redirect('/login')

    const { id } = await params
    const patient = await getPatient(id, session.userId)

    if (!patient) {
        notFound()
    }

    return (
        <div className="patient-detail-page">
            <div className="page-header">
                <Link href="/dashboard/patients" className="back-link">
                    ← Back to Patients
                </Link>
            </div>

            {/* Patient Info Header */}
            <div className="patient-profile-card">
                <div className="patient-avatar-lg">
                    {patient.name.charAt(0)}
                </div>
                <div className="patient-profile-info">
                    <h1 className="patient-profile-name">{patient.name}</h1>
                    <p className="patient-profile-meta">Age {patient.age} years</p>
                    {patient.diagnosis && (
                        <p className="patient-profile-diagnosis">{patient.diagnosis}</p>
                    )}
                    {patient.notes && (
                        <p className="patient-profile-notes">{patient.notes}</p>
                    )}
                </div>
                <div className="patient-profile-stats">
                    <div className="profile-stat">
                        <div className="profile-stat-value">{patient.mmseScore || '--'}</div>
                        <div className="profile-stat-label">MMSE Score</div>
                    </div>
                    <div className="profile-stat">
                        <div className="profile-stat-value">{patient._count.sessions}</div>
                        <div className="profile-stat-label">Sessions</div>
                    </div>
                    <div className="profile-stat">
                        <div className="profile-stat-value">{patient._count.memories}</div>
                        <div className="profile-stat-label">Memories</div>
                    </div>
                    <div className="profile-stat">
                        <div className="profile-stat-value">{patient._count.familyMembers}</div>
                        <div className="profile-stat-label">Family</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <Link href="/dashboard/memories/new" className="action-card">
                    <span className="action-icon">🖼️</span>
                    <span className="action-text">Add Memory</span>
                </Link>
                <Link href="/dashboard/family/new" className="action-card">
                    <span className="action-icon">👨‍👩‍👧</span>
                    <span className="action-text">Add Family</span>
                </Link>
                <Link href="/dashboard/sessions" className="action-card">
                    <span className="action-icon">📅</span>
                    <span className="action-text">View Sessions</span>
                </Link>
                <Link href="/dashboard/progress" className="action-card">
                    <span className="action-icon">📊</span>
                    <span className="action-text">View Progress</span>
                </Link>
            </div>

            {/* Recent Sessions */}
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title">Recent Sessions</h2>
                    <Link href="/dashboard/sessions" className="section-link">View All →</Link>
                </div>
                <div className="section-body">
                    {patient.sessions.length > 0 ? (
                        <div className="mini-list">
                            {patient.sessions.map(s => (
                                <div key={s.id} className="mini-list-item">
                                    <span>{new Date(s.date).toLocaleDateString('en-IN')}</span>
                                    <span>{s.mood === 'happy' ? '😊' : s.mood === 'sad' ? '😢' : '😐'}</span>
                                    <span>{s.duration} min</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-text-small">No sessions yet</p>
                    )}
                </div>
            </div>

            {/* Family Members */}
            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title">Family Members</h2>
                    <Link href="/dashboard/family" className="section-link">Manage →</Link>
                </div>
                <div className="section-body">
                    {patient.familyMembers.length > 0 ? (
                        <div className="family-chips">
                            {patient.familyMembers.map(f => (
                                <div key={f.id} className="family-chip">
                                    <span className="chip-avatar">{f.name.charAt(0)}</span>
                                    <span className="chip-name">{f.name}</span>
                                    <span className="chip-relation">{f.relationship}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-text-small">No family members added</p>
                    )}
                </div>
            </div>
        </div>
    )
}
