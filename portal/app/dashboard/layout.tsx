// Dashboard Layout with Horizontal Header (Reference Match)
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import DashboardClientWrapper from './DashboardClientWrapper'
import DashboardHeader from './DashboardHeader'
import { Outfit } from 'next/font/google'

const outfit = Outfit({ subsets: ['latin'] })

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
  const firstName = session.name.split(' ')[0]

  // Find selected patient name for the "Caring For" pill
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0]

  return (
    <DashboardClientWrapper
      patients={patients.map(p => ({ id: p.id, name: p.name, age: p.age, photoUrl: p.photoUrl || undefined }))}
      selectedPatientId={selectedPatientId}
    >
      <div className={`min-h-screen bg-transparent ${outfit.className}`}>

        <DashboardHeader
          user={session}
          patients={patients}
          selectedPatientId={selectedPatientId}
        />

        {/* Main Content Area */}
        <main className="p-6 pt-28 lg:p-12 lg:pt-28 max-w-[1920px] mx-auto min-h-[calc(100vh-80px)]">
          {children}
        </main>

      </div>
    </DashboardClientWrapper>
  )
}
