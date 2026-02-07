// Dashboard Home Page
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

async function getDashboardStats(userId: string) {
  // Get counts in parallel
  const [patientsResult, sessionsResult, memoriesResult] = await Promise.all([
    supabaseAdmin.from('Patient').select('id', { count: 'exact', head: true }).eq('caregiverId', userId),
    supabaseAdmin.from('TherapySession').select('id', { count: 'exact', head: true }).eq('caregiverId', userId),
    supabaseAdmin.from('Memory').select('id, patientId', { count: 'exact', head: true })
  ])

  // For memories, we need to filter by caregiver's patients
  const { data: patientIds } = await supabaseAdmin
    .from('Patient')
    .select('id')
    .eq('caregiverId', userId)

  let memoriesCount = 0
  if (patientIds && patientIds.length > 0) {
    const { count } = await supabaseAdmin
      .from('Memory')
      .select('id', { count: 'exact', head: true })
      .in('patientId', patientIds.map(p => p.id))
    memoriesCount = count || 0
  }

  // Recent sessions with patient details
  const { data: recentSessionsRaw } = await supabaseAdmin
    .from('TherapySession')
    .select('*')
    .eq('caregiverId', userId)
    .order('date', { ascending: false })
    .limit(5)

  // Get patient info for each session
  const recentSessions = await Promise.all(
    (recentSessionsRaw || []).map(async (s) => {
      const { data: patient } = await supabaseAdmin
        .from('Patient')
        .select('name')
        .eq('id', s.patientId)
        .single()
      return { ...s, patient: patient || { name: 'Unknown' } }
    })
  )

  // Patients list
  const { data: patientsList } = await supabaseAdmin
    .from('Patient')
    .select('*')
    .eq('caregiverId', userId)
    .order('updatedAt', { ascending: false })
    .limit(5)

  return {
    patients: patientsResult.count || 0,
    sessions: sessionsResult.count || 0,
    memories: memoriesCount,
    recentSessions,
    patientsList: patientsList || []
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const stats = await getDashboardStats(session.userId)

  return (
    <div className="dashboard-home">
      {/* Welcome Section with Vibrant Gradient */}
      <div className="welcome-banner">
        <h1 className="welcome-title">Welcome back, {session.name.split(' ')[0]}!</h1>
        <p className="welcome-subtitle">
          Your digital reminiscence companion is ready. You have {stats.patients} patients to care for today.
        </p>
      </div>

      {/* Quick Actions Revamp */}
      <div className="quick-actions">
        <Link href="/dashboard/patients/new" className="action-btn">
          <div className="action-icon-wrapper">
            <img src="/icons/patients.png" alt="" className="premium-icon" />
          </div>
          <span className="action-text">Add Patient</span>
        </Link>
        <Link href="/dashboard/memories" className="action-btn">
          <div className="action-icon-wrapper">
            <img src="/icons/memories.png" alt="" className="premium-icon" />
          </div>
          <span className="action-text">Upload Photos</span>
        </Link>
        <Link href="/dashboard/progress" className="action-btn">
          <div className="action-icon-wrapper">
            <img src="/icons/analytics.png" alt="" className="premium-icon" />
          </div>
          <span className="action-text">View Stats</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-3d">
            <img src="/icons/patients.png" alt="" className="stat-icon-img" />
          </div>
          <div className="stat-value">{stats.patients}</div>
          <div className="stat-label">Active Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-3d">
            <img src="/icons/sessions.png" alt="" className="stat-icon-img" />
          </div>
          <div className="stat-value">{stats.sessions}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-3d">
            <img src="/icons/memories.png" alt="" className="stat-icon-img" />
          </div>
          <div className="stat-value">{stats.memories}</div>
          <div className="stat-label">Memories Stored</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-3d">
            <img src="/icons/analytics.png" alt="" className="stat-icon-img" />
          </div>
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
