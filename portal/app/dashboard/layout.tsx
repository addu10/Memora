// Dashboard Layout with Patient Selection and Sidebar Navigation
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import PatientSelector from './PatientSelector'
import LogoutButton from './LogoutButton'

async function getPatients(userId: string) {
  return prisma.patient.findMany({
    where: { caregiverId: userId },
    orderBy: { updatedAt: 'desc' }
  })
}

async function getSelectedPatientId() {
  const cookieStore = await cookies()
  return cookieStore.get('selectedPatientId')?.value
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const patients = await getPatients(session.userId)
  const selectedPatientId = await getSelectedPatientId()
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0]

  // If no patients, redirect to add patient
  const hasPatients = patients.length > 0

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>🧠</span>
          <span>Memora</span>
        </div>

        {/* Patient Selector */}
        {hasPatients && (
          <div className="patient-selector-wrapper">
            <PatientSelector
              patients={patients}
              selectedPatientId={selectedPatient?.id}
            />
          </div>
        )}

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Overview</div>
            <Link href="/dashboard" className="nav-item">
              <span className="nav-icon">📊</span>
              <span className="nav-text">Dashboard</span>
            </Link>
          </div>

          {hasPatients && (
            <>
              <div className="nav-section">
                <div className="nav-section-title">Therapy</div>
                <Link href="/dashboard/memories" className="nav-item">
                  <span className="nav-icon">🖼️</span>
                  <span className="nav-text">Memories</span>
                </Link>
                <Link href="/dashboard/family" className="nav-item">
                  <span className="nav-icon">👨‍👩‍👧‍👦</span>
                  <span className="nav-text">Family Members</span>
                </Link>
                <Link href="/dashboard/sessions" className="nav-item">
                  <span className="nav-icon">📅</span>
                  <span className="nav-text">Sessions</span>
                </Link>
              </div>

              <div className="nav-section">
                <div className="nav-section-title">Analytics</div>
                <Link href="/dashboard/progress" className="nav-item">
                  <span className="nav-icon">📈</span>
                  <span className="nav-text">Progress</span>
                </Link>
                <Link href="/dashboard/reports" className="nav-item">
                  <span className="nav-icon">📋</span>
                  <span className="nav-text">Reports</span>
                </Link>
              </div>
            </>
          )}

          <div className="nav-section">
            <div className="nav-section-title">Settings</div>
            <Link href="/dashboard/patients" className="nav-item">
              <span className="nav-icon">👥</span>
              <span className="nav-text">Manage Patients</span>
            </Link>
            <Link href="/dashboard/settings" className="nav-item">
              <span className="nav-icon">⚙️</span>
              <span className="nav-text">Settings</span>
            </Link>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="user-name">{session.name}</div>
              <div className="user-email">{session.email}</div>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-body">
          {children}
        </div>
      </main>
    </div>
  )
}
