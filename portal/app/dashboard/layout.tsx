// Dashboard Layout with Patient Selection and Sidebar Navigation
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import PatientSelector from './PatientSelector'
import LogoutButton from './LogoutButton'
import DashboardClientWrapper from './DashboardClientWrapper'
import UserDropdown from './UserDropdown'

async function getPatients(userId: string) {
  const { data } = await supabaseAdmin
    .from('Patient')
    .select('*')
    .eq('caregiverId', userId)
    .order('updatedAt', { ascending: false })
  return data || []
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

  const hasPatients = patients.length > 0

  return (
    <DashboardClientWrapper
      patients={patients.map(p => ({ id: p.id, name: p.name, age: p.age, photoUrl: p.photoUrl || undefined }))}
      selectedPatientId={selectedPatientId}
    >
      <div className="dashboard-layout">
        {/* Top Navbar */}
        <header className="navbar">
          <div className="navbar-left">
            <Link href="/dashboard" className="navbar-logo">
              <img src="/icons/logo.png" alt="" className="premium-icon logo-icon-sm" />
              <span className="logo-text">Memora</span>
            </Link>

            <nav className="navbar-nav">
              <Link href="/dashboard" className="nav-link">
                <img src="/icons/overview.png" alt="" className="premium-icon" />
                <span className="nav-text">Overview</span>
              </Link>
              {hasPatients && (
                <>
                  <Link href="/dashboard/memories" className="nav-link">
                    <img src="/icons/memories.png" alt="" className="premium-icon" />
                    <span className="nav-text">Memories</span>
                  </Link>
                  <Link href="/dashboard/family" className="nav-link">
                    <img src="/icons/family.png" alt="" className="premium-icon" />
                    <span className="nav-text">Family</span>
                  </Link>
                  <Link href="/dashboard/sessions" className="nav-link">
                    <img src="/icons/sessions.png" alt="" className="premium-icon" />
                    <span className="nav-text">Sessions</span>
                  </Link>
                  <Link href="/dashboard/progress" className="nav-link">
                    <img src="/icons/analytics.png" alt="" className="premium-icon" />
                    <span className="nav-text">Analytics</span>
                  </Link>
                </>
              )}
              <Link href="/dashboard/patients" className="nav-link">
                <img src="/icons/patients.png" alt="" className="premium-icon" />
                <span className="nav-text">Patients</span>
              </Link>
            </nav>
          </div>

          <div className="navbar-right">
            {hasPatients && (
              <PatientSelector
                patients={patients.map(p => ({ id: p.id, name: p.name, age: p.age, photoUrl: p.photoUrl }))}
                selectedPatientId={selectedPatient?.id}
              />
            )}
            <UserDropdown userName={session.name} />
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-body">
            {children}
          </div>
        </main>
      </div>
    </DashboardClientWrapper>
  )
}
