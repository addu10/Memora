// Dashboard Home Page
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

async function getDashboardStats(userId: string) {
  // Get counts in parallel
  const [patientsResult, sessionsResult, memoriesResult] = await Promise.all([
    supabaseAdmin.from('Patient').select('id', { count: 'exact', head: true }).eq('caregiverId', userId),
    supabaseAdmin.from('TherapySession').select('id', { count: 'exact', head: true }).eq('caregiverId', userId),
    supabaseAdmin.from('Memory').select('id', { count: 'exact', head: true }).eq('caregiverId', userId)
  ])

  // Get recent sessions with patient details
  const { data: recentSessions } = await supabaseAdmin
    .from('TherapySession')
    .select(`
      id,
      date,
      duration,
      mood,
      notes,
      patient:Patient(id, name, dateOfBirth)
    `)
    .eq('caregiverId', userId)
    .order('date', { ascending: false })
    .limit(4)

  // Get list of active patients
  const { data: patientsList } = await supabaseAdmin
    .from('Patient')
    .select('id, name, dateOfBirth, key_memories, mmseScore')
    .eq('caregiverId', userId)
    .order('createdAt', { ascending: false })
    .limit(5)

  return {
    patients: patientsResult.count || 0,
    sessions: sessionsResult.count || 0,
    memories: memoriesResult.count || 0,
    recentSessions: recentSessions || [],
    patientsList: patientsList || []
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return <div className="p-8 text-center text-red-500">Please log in to view the dashboard.</div>

  const stats = await getDashboardStats(session.userId)
  const firstName = session.name.split(' ')[0]

  return (
    <div className="space-y-6">
      {/* 1. Hero & Bento Grid Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Welcome Card (Spans 2 cols) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white shadow-lifted p-8 flex flex-col justify-between min-h-[200px]">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary-200 font-bold uppercase tracking-wider text-xs">
              <span>👋 Welcome Back</span>
              <span className="w-1 h-1 bg-primary-200 rounded-full"></span>
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Good Morning, {firstName}</h1>
            <p className="text-primary-100 max-w-md mt-1">
              You have {stats.sessions > 0 ? 'a great track record' : 'no sessions yet'} this week. Ready to make a difference?
            </p>
          </div>

          <div className="relative z-10 mt-6 flex gap-3">
            <Link href="/dashboard/sessions/new" className="bg-white text-primary-700 hover:bg-primary-50 px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
              <span>▶</span> Start Session
            </Link>
            <Link href="/dashboard/patients/new" className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all backdrop-blur-sm">
              + Add Patient
            </Link>
          </div>
        </div>

        {/* Stats Stack (Spans 1 col) */}
        <div className="grid grid-rows-2 gap-4">
          {/* Row 1: Patients & Memories */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-soft border border-lavender-100 flex flex-col items-center justify-center gap-1 hover:border-primary-200 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center text-xl mb-1 group-hover:scale-110 transition-transform">👥</div>
              <span className="text-3xl font-extrabold text-gray-800">{stats.patients}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Patients</span>
            </div>
            <div className="bg-white rounded-3xl p-5 shadow-soft border border-lavender-100 flex flex-col items-center justify-center gap-1 hover:border-primary-200 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl mb-1 group-hover:scale-110 transition-transform">📸</div>
              <span className="text-3xl font-extrabold text-gray-800">{stats.memories}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Memories</span>
            </div>
          </div>

          {/* Row 2: Engagement Score (Compact) */}
          <div className="bg-white rounded-3xl p-5 shadow-soft border border-lavender-100 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-50"></div>
            <div className="relative z-10 flex-1">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-gray-500">Engagement Score</span>
                <span className="text-2xl font-extrabold text-gray-800">94<span className="text-sm text-gray-400 font-medium">/100</span></span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 w-[94%]"></div>
              </div>
              <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                <span>↗</span> Top 5% Activity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

        {/* Left: Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-soft border border-lavender-100 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            <Link href="/dashboard/sessions" className="text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline">View History</Link>
          </div>

          <div className="flex-1 space-y-4">
            {stats.recentSessions.length > 0 ? (
              stats.recentSessions.map((s: any) => (
                <div key={s.id} className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold leading-none ${s.mood === 'happy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    <span className="uppercase text-[10px] opacity-70">{new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-lg">{new Date(s.date).getDate()}</span>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{s.patient.name}</h4>
                    <p className="text-sm text-gray-500">Reminiscence Therapy • {s.duration} mins</p>
                  </div>

                  <div className="hidden sm:block">
                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 shadow-sm">
                      {s.mood || 'Neutral'}
                    </span>
                  </div>
                  <div className="text-gray-300 group-hover:text-primary-400">→</div>
                </div>
              ))
            ) : (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm mb-4">💤</div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">No sessions yet</h3>
                <p className="text-gray-500 text-sm max-w-xs mx-auto mb-4">
                  Your recent activity will appear here. Start a session to track progress.
                </p>
                <Link href="/dashboard/sessions/new" className="text-primary-600 font-bold hover:underline">Start First Session</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Stats & Patients */}
        <div className="flex flex-col gap-6">
          {/* Active Patients Mini-List */}
          <div className="bg-white rounded-3xl shadow-soft border border-lavender-100 p-6 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Your Patients</h3>
              <Link href="/dashboard/patients/new" className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors">
                ＋
              </Link>
            </div>

            <div className="space-y-3">
              {stats.patientsList.slice(0, 4).map((p: any) => (
                <Link key={p.id} href={`/dashboard/patients/${p.id}`} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 border-2 border-white shadow-sm group-hover:border-primary-200 transition-all">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">Last active: Recently</p>
                  </div>
                </Link>
              ))}
              {stats.patientsList.length === 0 && (
                <p className="text-sm text-gray-400 italic">No patients added yet.</p>
              )}
            </div>

            <Link href="/dashboard/patients" className="block mt-6 text-center text-xs font-bold text-gray-400 hover:text-primary-600 uppercase tracking-widest transition-colors">
              View All Patients
            </Link>
          </div>

          {/* Quick Upload Memory Card */}
          <Link href="/dashboard/memories/new" className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 p-6 text-white shadow-lifted hover:-translate-y-1 transition-all">
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/20 rounded-full blur-2xl translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                📸
              </div>
              <div>
                <h3 className="font-bold text-lg">Upload Memory</h3>
                <p className="text-pink-100 text-xs font-medium">Preserve a moment now</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
