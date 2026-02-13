// Patient Detail Page
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect, notFound } from 'next/navigation'
import {
    ArrowLeft,
    Brain,
    Users,
    Calendar,
    TrendingUp,
    Clock,
    Activity,
    MoreHorizontal,
    Plus
} from 'lucide-react'


async function getPatient(patientId: string, userId: string) {
    // Get patient
    const { data: patient, error } = await supabaseAdmin
        .from('Patient')
        .select('*')
        .eq('id', patientId)
        .eq('caregiverId', userId)
        .single()

    if (error || !patient) return null

    // Get related data in parallel
    const [memoriesResult, familyResult, sessionsResult, countsResult] = await Promise.all([
        supabaseAdmin.from('Memory').select('*').eq('patientId', patientId).order('date', { ascending: false }).limit(5),
        supabaseAdmin.from('FamilyMember').select('*').eq('patientId', patientId),
        supabaseAdmin.from('TherapySession').select('*').eq('patientId', patientId).order('date', { ascending: false }).limit(5),
        Promise.all([
            supabaseAdmin.from('TherapySession').select('id', { count: 'exact', head: true }).eq('patientId', patientId),
            supabaseAdmin.from('Memory').select('id', { count: 'exact', head: true }).eq('patientId', patientId),
            supabaseAdmin.from('FamilyMember').select('id', { count: 'exact', head: true }).eq('patientId', patientId)
        ])
    ])

    return {
        ...patient,
        memories: memoriesResult.data || [],
        familyMembers: familyResult.data || [],
        sessions: sessionsResult.data || [],
        _count: {
            sessions: countsResult[0].count || 0,
            memories: countsResult[1].count || 0,
            familyMembers: countsResult[2].count || 0
        }
    }
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            {/* Header Navigation */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard/patients"
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-bold transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Patients</span>
                </Link>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-indigo-100/50 border border-white/50 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-50/50 to-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center text-4xl md:text-5xl font-extrabold shadow-2xl shadow-primary-500/30">
                        {patient.name.charAt(0)}
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">{patient.name}</h1>
                            {patient.diagnosis && (
                                <span className="inline-flex px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold uppercase tracking-wider border border-primary-100 w-fit">
                                    {patient.diagnosis}
                                </span>
                            )}
                        </div>

                        <p className="text-neutral-500 font-medium flex items-center gap-4">
                            <span>Age <span className="text-neutral-900 font-bold">{patient.age}</span></span>
                            <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                            <span>PIN <span className="text-neutral-900 font-bold tracking-widest">{patient.pin}</span></span>
                        </p>

                        {patient.notes && (
                            <p className="text-neutral-600 text-sm italic max-w-xl mt-2">{patient.notes}</p>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                        <div className="bg-neutral-50 rounded-2xl p-4 min-w-[100px] border border-neutral-100">
                            <div className="text-2xl font-extrabold text-neutral-900">{patient.mmseScore || '--'}</div>
                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">MMSE Score</div>
                        </div>
                        <div className="bg-neutral-50 rounded-2xl p-4 min-w-[100px] border border-neutral-100">
                            <div className="text-2xl font-extrabold text-neutral-900">{patient._count.sessions}</div>
                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Sessions</div>
                        </div>
                        <div className="bg-neutral-50 rounded-2xl p-4 min-w-[100px] border border-neutral-100">
                            <div className="text-2xl font-extrabold text-neutral-900">{patient._count.memories}</div>
                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Memories</div>
                        </div>
                        <div className="bg-neutral-50 rounded-2xl p-4 min-w-[100px] border border-neutral-100">
                            <div className="text-2xl font-extrabold text-neutral-900">{patient._count.familyMembers}</div>
                            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Family</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dashboard/memories/new" className="group bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-lg hover:border-primary-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Brain size={24} />
                    </div>
                    <h3 className="font-bold text-neutral-900">Add Memory</h3>
                    <p className="text-xs text-neutral-500 font-medium mt-1">Upload photos/videos</p>
                </Link>
                <Link href="/dashboard/family/new" className="group bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-lg hover:border-primary-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                    <h3 className="font-bold text-neutral-900">Add Family</h3>
                    <p className="text-xs text-neutral-500 font-medium mt-1">Connect relatives</p>
                </Link>
                <Link href="/dashboard/sessions" className="group bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-lg hover:border-primary-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Calendar size={24} />
                    </div>
                    <h3 className="font-bold text-neutral-900">View Sessions</h3>
                    <p className="text-xs text-neutral-500 font-medium mt-1">History & notes</p>
                </Link>
                <Link href="/dashboard/progress" className="group bg-white p-4 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-lg hover:border-primary-100 transition-all duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="font-bold text-neutral-900">View Progress</h3>
                    <p className="text-xs text-neutral-500 font-medium mt-1">Analytics & reports</p>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Sessions List */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm-soft border border-neutral-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                            <Clock size={20} className="text-primary-500" />
                            Recent Sessions
                        </h2>
                        <Link href="/dashboard/sessions" className="text-sm font-bold text-primary-600 hover:text-primary-700">View All →</Link>
                    </div>

                    <div className="space-y-3">
                        {patient.sessions.length > 0 ? (
                            patient.sessions.map((s: any) => (
                                <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 font-bold">
                                            {new Date(s.date).getDate()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-neutral-900">{new Date(s.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}</p>
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{s.duration} minutes</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 rounded-lg bg-white border border-neutral-200 text-xs font-bold text-neutral-600 shadow-sm">
                                        {s.mood}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                                <p className="text-neutral-400 font-medium">No sessions recorded yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Family Members List */}
                <div className="bg-white rounded-3xl p-6 shadow-sm-soft border border-neutral-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                            <Users size={20} className="text-primary-500" />
                            Family
                        </h2>
                        <Link href="/dashboard/family" className="text-sm font-bold text-primary-600 hover:text-primary-700">Manage →</Link>
                    </div>

                    <div className="space-y-3">
                        {patient.familyMembers.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {patient.familyMembers.map((f: any) => (
                                    <div key={f.id} className="flex items-center gap-2 pr-3 py-1 pl-1 bg-neutral-50 border border-neutral-100 rounded-full hover:bg-neutral-100 transition-colors cursor-default">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                            {f.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-neutral-900 leading-none">{f.name}</span>
                                            <span className="text-[10px] font-medium text-neutral-500 leading-none mt-0.5">{f.relationship}</span>
                                        </div>
                                    </div>
                                ))}
                                <Link href="/dashboard/family/new" className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-dashed border-neutral-300 text-neutral-400 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-all">
                                    <Plus size={16} />
                                </Link>
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                                <p className="text-neutral-400 font-medium text-sm">No family members added</p>
                                <Link href="/dashboard/family/new" className="text-primary-600 text-xs font-bold mt-2 hover:underline">Add Family Member</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
