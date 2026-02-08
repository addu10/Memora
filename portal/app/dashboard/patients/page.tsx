// Patients List Page with Delete Option
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import DeletePatientButton from './DeletePatientButton'
import { Users, UserPlus, Brain, Clock, Heart, ArrowRight } from 'lucide-react'

export default async function PatientsPage() {
  const session = await getSession()
  if (!session) return null

  // Get patients with counts
  const { data: patientsRaw } = await supabaseAdmin
    .from('Patient')
    .select('*')
    .eq('caregiverId', session.userId)
    .order('updatedAt', { ascending: false })

  // Get counts for each patient
  const patients = await Promise.all(
    (patientsRaw || []).map(async (patient) => {
      const [sessionsCount, memoriesCount, familyCount] = await Promise.all([
        supabaseAdmin.from('TherapySession').select('id', { count: 'exact', head: true }).eq('patientId', patient.id),
        supabaseAdmin.from('Memory').select('id', { count: 'exact', head: true }).eq('patientId', patient.id),
        supabaseAdmin.from('FamilyMember').select('id', { count: 'exact', head: true }).eq('patientId', patient.id)
      ])
      return {
        ...patient,
        _count: {
          sessions: sessionsCount.count || 0,
          memories: memoriesCount.count || 0,
          familyMembers: familyCount.count || 0
        }
      }
    })
  )

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest border border-indigo-100">
              Care Profiles
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x">Patients</span>
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-medium max-w-xl">
            Your loved ones receiving clinical reminiscence therapy.
          </p>
        </div>

        <Link
          href="/dashboard/patients/new"
          className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
          <span>Add New Patient</span>
        </Link>
      </div>

      {patients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {patients.map((patient, index) => (
            <div
              key={patient.id}
              className="group relative flex flex-col justify-between glass-card rounded-[2.5rem] p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
              style={{ animationDelay: `${index * 100}ms` }}
            >


              <div>
                {/* Visual Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-20 h-20 rounded-[1.2rem] bg-gradient-to-br ${index % 3 === 0 ? 'from-violet-500 to-purple-600' :
                    index % 3 === 1 ? 'from-indigo-500 to-blue-600' :
                      'from-pink-500 to-rose-600'
                    } text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {patient.name.charAt(0)}
                  </div>

                  {/* MMSE Score Pill */}
                  <div className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border backdrop-blur-sm ${patient.mmseScore && patient.mmseScore < 24
                    ? 'bg-amber-50 text-amber-700 border-amber-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${patient.mmseScore && patient.mmseScore < 24 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}></div>
                    MMSE {patient.mmseScore || 'N/A'}
                  </div>
                </div>

                {/* Patient Info */}
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">
                    {patient.name}
                  </h3>
                  <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                      Age {patient.age}
                    </span>
                    {patient.diagnosis && (
                      <span className="truncate italic max-w-[180px]">
                        {patient.diagnosis}
                      </span>
                    )}
                  </div>
                </div>

                {/* Micro Stats */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-white/60 rounded-2xl p-3 text-center border border-white/60 shadow-sm group-hover:bg-white transition-colors">
                    <div className="text-xl font-black text-slate-900">{patient._count.sessions}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Sessions</div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-3 text-center border border-white/60 shadow-sm group-hover:bg-white transition-colors">
                    <div className="text-xl font-black text-slate-900">{patient._count.memories}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Memories</div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-3 text-center border border-white/60 shadow-sm group-hover:bg-white transition-colors">
                    <div className="text-xl font-black text-slate-900">{patient._count.familyMembers}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Family</div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-3 mt-auto pt-6 border-t border-slate-100/50">
                <Link
                  href={`/dashboard/patients/${patient.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 py-3 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-indigo-200 group/btn"
                >
                  <span>View Profile</span>
                  <ArrowRight size={16} className="opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                </Link>

                {/* Delete Button Wrapper to ensure style consistency */}
                <div className="shrink-0">
                  <DeletePatientButton patientId={patient.id} patientName={patient.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative rounded-[2.5rem] overflow-hidden bg-white/40 backdrop-blur-md border border-white/60 p-16 text-center shadow-lg max-w-2xl mx-auto mt-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl -z-10"></div>

          <div className="w-24 h-24 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-100/50 rotate-3 transition-transform hover:rotate-6">
            <Users size={40} className="text-indigo-500" />
          </div>

          <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">No Patients Linked</h2>
          <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Start your journey by adding a loved one to provide them with clinical reminiscence therapy.
          </p>

          <Link
            href="/dashboard/patients/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all hover:scale-105 hover:shadow-indigo-300"
          >
            <UserPlus size={24} />
            <span>Add Your First Patient</span>
          </Link>
        </div>
      )}
    </div>
  )
}

