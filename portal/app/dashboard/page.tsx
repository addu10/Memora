
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { Users, Brain, Activity, Plus, ArrowRight, Clock, Heart, Zap, Sparkles } from 'lucide-react'

export default async function DashboardOverview() {
  const session = await getSession()
  if (!session) return null

  // 1. Fetch Key Metrics
  const { count: patientCount } = await supabaseAdmin
    .from('Patient')
    .select('*', { count: 'exact', head: true })
    .eq('caregiverId', session.userId)

  const { data: allPatients } = await supabaseAdmin
    .from('Patient')
    .select('id')
    .eq('caregiverId', session.userId)

  const patientIds = allPatients?.map(p => p.id) || []

  let totalMemories = 0
  let totalSessions = 0

  if (patientIds.length > 0) {
    const { count: mCount } = await supabaseAdmin
      .from('Memory')
      .select('*', { count: 'exact', head: true })
      .in('patientId', patientIds)
    totalMemories = mCount || 0

    const { count: sCount } = await supabaseAdmin
      .from('TherapySession')
      .select('*', { count: 'exact', head: true })
      .in('patientId', patientIds)
    totalSessions = sCount || 0
  }

  // Get first name
  const firstName = session.name.split(' ')[0]

  return (
    <div className="w-full max-w-[1800px] mx-auto min-h-[85vh] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-6">

      {/* TOP ROW: GREETING (66%) + ACTIONS (33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">

        {/* 1. WELCOME CARD (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-violet-50 to-white rounded-[3rem] p-12 relative overflow-hidden flex flex-col justify-center shadow-xl border-[6px] border-white ring-1 ring-violet-100/50">
          {/* Decorative Blobs */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-violet-200/40 to-fuchsia-200/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-indigo-200/40 to-blue-200/40 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-violet-700 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border-2 border-white shadow-sm w-fit">
              <Sparkles size={16} className="text-violet-600 fill-violet-600" />
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.05]">
              Hello, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x">
                {firstName}.
              </span>
            </h1>

            <p className="text-slate-500 text-2xl font-medium max-w-2xl leading-relaxed">
              Your dashboard is ready. You have <strong className="text-slate-900">{patientCount || 0} active patients</strong> and <strong className="text-slate-900">{totalMemories} memories</strong> preserved today.
            </p>
          </div>
        </div>

        {/* 2. QUICK ACTIONS STACK (Spans 1 col) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Add Patient */}
          <Link href="/dashboard/patients/new" className="group flex-1 bg-white hover:bg-emerald-50/50 rounded-[2.5rem] border-[6px] border-white ring-1 ring-slate-100 hover:ring-emerald-200 p-8 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-emerald-100/50 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Plus size={32} strokeWidth={2.5} />
              </div>
              <div className="p-3 rounded-full bg-slate-50 text-slate-300 group-hover:bg-white group-hover:text-emerald-600 transition-colors">
                <ArrowRight size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-700 mb-1 transition-colors">Add Patient</h3>
              <p className="text-slate-400 font-medium">Create a new care profile</p>
            </div>
          </Link>

          {/* Add Memory */}
          <Link href="/dashboard/memories/new" className="group flex-1 bg-white hover:bg-fuchsia-50/50 rounded-[2.5rem] border-[6px] border-white ring-1 ring-slate-100 hover:ring-fuchsia-200 p-8 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-fuchsia-100/50 hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 rounded-[1.5rem] bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Heart size={32} strokeWidth={2.5} />
              </div>
              <div className="p-3 rounded-full bg-slate-50 text-slate-300 group-hover:bg-white group-hover:text-fuchsia-600 transition-colors">
                <ArrowRight size={24} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-fuchsia-700 mb-1 transition-colors">Add Memory</h3>
              <p className="text-slate-400 font-medium">Upload photos & stories</p>
            </div>
          </Link>
        </div>
      </div>

      {/* BOTTOM ROW: STATS (1/3 each) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[280px]">
        {/* Patients Stat */}
        <Link href="/dashboard/patients" className="group bg-white hover:bg-violet-50/50 rounded-[2.5rem] border-[6px] border-white ring-1 ring-slate-100 hover:ring-violet-200 p-8 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
            <Users size={160} className="transform rotate-12 translate-x-8 -translate-y-8" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-violet-100 text-violet-600">
              <Users size={28} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Patients</span>
          </div>
          <div className="relative z-10">
            <div className="text-6xl font-black text-slate-900 tracking-tighter">{patientCount || 0}</div>
            <div className="text-violet-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Manage Profiles <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Memories Stat (Featured) */}
        <Link href="/dashboard/memories" className="group bg-[#2e1d4e] hover:bg-[#3b2563] rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden border-[6px] border-white/10 ring-1 ring-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 to-indigo-600/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute top-0 right-0 p-8 opacity-[0.15] group-hover:opacity-[0.25] transition-opacity duration-500">
            <Brain size={160} className="text-white transform rotate-12 translate-x-8 -translate-y-8" />
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/5">
              <Brain size={28} />
            </div>
            <span className="text-sm font-bold text-violet-200 uppercase tracking-wider">Memories</span>
          </div>
          <div className="relative z-10">
            <div className="text-6xl font-black text-white tracking-tighter">{totalMemories}</div>
            <div className="text-violet-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Gallery <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* Sessions Stat */}
        <Link href="/dashboard/sessions" className="group bg-white hover:bg-purple-50/50 rounded-[2.5rem] border-[6px] border-white ring-1 ring-slate-100 hover:ring-purple-200 p-8 flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
            <Clock size={160} className="transform rotate-12 translate-x-8 -translate-y-8" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-purple-100 text-purple-600">
              <Clock size={28} />
            </div>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Sessions</span>
          </div>
          <div className="relative z-10">
            <div className="text-6xl font-black text-slate-900 tracking-tighter">{totalSessions}</div>
            <div className="text-purple-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Start Therapy <ArrowRight size={16} />
            </div>
          </div>
        </Link>
      </div>

    </div>
  )
}
