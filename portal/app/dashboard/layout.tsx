// Dashboard Layout with Patient Selection and Sidebar Navigation
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import DashboardClientWrapper from './DashboardClientWrapper'

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

  // Basic first name extraction for the sidebar
  const firstName = session.name.split(' ')[0]

  return (
    <DashboardClientWrapper
      patients={patients.map(p => ({ id: p.id, name: p.name, age: p.age, photoUrl: p.photoUrl || undefined }))}
      selectedPatientId={selectedPatientId}
    >
      <div className="min-h-screen bg-primary-50 flex font-sans text-gray-800">
        {/* Sidebar Navigation */}
        <aside className="w-20 lg:w-64 bg-white hidden md:flex flex-col border-r border-lavender-200 sticky top-0 h-screen z-10">
          <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-lavender-100">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-200">
              M
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900 hidden lg:block tracking-tight">Memora</span>
          </div>

          <nav className="flex-1 py-8 px-4 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 bg-primary-50 text-primary-700 rounded-2xl transition-all font-semibold hover:bg-primary-100">
              <span className="text-xl">🏠</span>
              <span className="hidden lg:block">Overview</span>
            </Link>
            <Link href="/dashboard/patients" className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-white hover:text-primary-600 hover:shadow-soft rounded-2xl transition-all font-medium">
              <span className="text-xl">👥</span>
              <span className="hidden lg:block">Patients</span>
            </Link>
            <Link href="/dashboard/sessions" className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-white hover:text-primary-600 hover:shadow-soft rounded-2xl transition-all font-medium">
              <span className="text-xl">🧠</span>
              <span className="hidden lg:block">Sessions</span>
            </Link>
            <Link href="/dashboard/memories" className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-white hover:text-primary-600 hover:shadow-soft rounded-2xl transition-all font-medium">
              <span className="text-xl">📸</span>
              <span className="hidden lg:block">Memories</span>
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-white hover:text-primary-600 hover:shadow-soft rounded-2xl transition-all font-medium mt-auto">
              <span className="text-xl">⚙️</span>
              <span className="hidden lg:block">Settings</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-lavender-100">
            <div className="flex items-center gap-3 bg-lavender-50 p-3 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-bold">
                {firstName[0]}
              </div>
              <div className="hidden lg:block overflow-hidden">
                <p className="text-sm font-bold text-gray-900 truncate">{session.name}</p>
                <p className="text-xs text-gray-500 truncate">Caregiver</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </DashboardClientWrapper>
  )
}
