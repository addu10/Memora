// Dashboard Home Page
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'

async function getDashboardStats(userId: string) {
  const [patients, sessions, memories] = await Promise.all([
    prisma.patient.count({ where: { caregiverId: userId } }),
    prisma.therapySession.count({ where: { caregiverId: userId } }),
    prisma.memory.count({
      where: { patient: { caregiverId: userId } }
    })
  ])

  // Recent sessions with details
  const recentSessions = await prisma.therapySession.findMany({
    where: { caregiverId: userId },
    include: { patient: true },
    orderBy: { date: 'desc' },
    take: 5
  })

  // Patients list
  const patientsList = await prisma.patient.findMany({
    where: { caregiverId: userId },
    take: 5,
    orderBy: { updatedAt: 'desc' }
  })

  return {
    patients,
    sessions,
    memories,
    recentSessions,
    patientsList
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const stats = await getDashboardStats(session.userId)

  return (
    <div className="dashboard-home">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, {session.name.split(' ')[0]}! 👋</h1>
        <p className="welcome-subtitle">Here's what's happening with your patients today.</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link href="/dashboard/patients/new" className="action-btn">
          <span className="action-icon">➕</span>
          <span className="action-text">Add New Patient</span>
        </Link>
        <Link href="/dashboard/sessions/new" className="action-btn">
          <span className="action-icon">🎯</span>
          <span className="action-text">Start Session</span>
        </Link>
        <Link href="/dashboard/memories" className="action-btn">
          <span className="action-icon">🖼️</span>
          <span className="action-text">Upload Memories</span>
        </Link>
        <Link href="/dashboard/progress" className="action-btn">
          <span className="action-icon">📊</span>
          <span className="action-text">View Analytics</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.patients}</div>
          <div className="stat-label">Active Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats.sessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🖼️</div>
          <div className="stat-value">{stats.memories}</div>
          <div className="stat-label">Memories Stored</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-value">--</div>
          <div className="stat-label">Avg. Recall Score</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Sessions */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Recent Sessions</h2>
            <Link href="/dashboard/sessions" className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
              View All
            </Link>
          </div>
          <div className="section-body">
            {stats.recentSessions.length > 0 ? (
              stats.recentSessions.map((s: any) => (
                <div key={s.id} className="session-item">
                  <div className="session-info">
                    <div className="session-avatar">
                      {s.patient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="session-patient">{s.patient.name}</div>
                      <div className="session-date">
                        {new Date(s.date).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {' · '}{s.duration} min
                      </div>
                    </div>
                  </div>
                  <div className="session-mood">
                    {s.mood === 'happy' && '😊'}
                    {s.mood === 'neutral' && '😐'}
                    {s.mood === 'sad' && '😢'}
                    {s.mood === 'confused' && '😕'}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No sessions yet</p>
                <Link href="/dashboard/sessions/new" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                  Start First Session
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Patients List */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Your Patients</h2>
            <Link href="/dashboard/patients/new" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
              + Add
            </Link>
          </div>
          <div className="section-body">
            {stats.patientsList.length > 0 ? (
              stats.patientsList.map((patient: any) => (
                <Link
                  key={patient.id}
                  href={`/dashboard/patients/${patient.id}`}
                  className="patient-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="session-avatar">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-meta">
                      Age {patient.age} · MMSE: {patient.mmseScore || 'N/A'}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="empty-state">
                <p>No patients yet</p>
                <Link href="/dashboard/patients/new" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
                  Add Patient
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
