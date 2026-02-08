// Sessions Page - View all therapy sessions
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import {
    Calendar,
    Clock,
    Brain,
    ChevronRight,
    MessageSquare,
    Activity,
    UserPlus
} from 'lucide-react'

function getMoodEmoji(mood: string) {
    switch (mood) {
        case 'happy': return '😊'
        case 'neutral': return '😐'
        case 'sad': return '😢'
        case 'confused': return '😕'
        default: return '🙂'
    }
}

function getAvgRecallScore(memories: any[]) {
    if (memories.length === 0) return 0
    const total = memories.reduce((sum, m) => sum + m.recallScore, 0)
    return (total / memories.length).toFixed(1)
}

export default async function SessionsPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const cookieStore = await cookies()
    const patientId = cookieStore.get('selectedPatientId')?.value

    let patient = null

    if (patientId) {
        const { data } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('id', patientId)
            .eq('caregiverId', session.userId)
            .single()
        patient = data
    }

    // If no patient found by ID (or no ID), try to get the first patient
    if (!patient) {
        const { data: firstPatient } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('caregiverId', session.userId)
            .limit(1)
            .single()

        patient = firstPatient
    }

    if (!patient) {
        return (
            <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm-soft border border-neutral-100 max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-300">
                    <UserPlus size={40} />
                </div>
                <h2 className="text-2xl font-extrabold text-neutral-900 mb-2">No Patient Added Yet</h2>
                <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                    Please add a patient to view their therapy sessions.
                </p>
                <Link
                    href="/dashboard/patients/new"
                    className="inline-flex items-center gap-2 bg-neutral-900 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 hover:scale-105 transition-all"
                >
                    <UserPlus size={20} />
                    <span>Add Patient</span>
                </Link>
            </div>
        )
    }

    // Get sessions for patient
    const { data: sessionsRaw } = await supabaseAdmin
        .from('TherapySession')
        .select('*')
        .eq('patientId', patient.id)
        .order('date', { ascending: false })

    // Get session memories for each session
    const sessions = await Promise.all(
        (sessionsRaw || []).map(async (s) => {
            const { data: sessionMemories } = await supabaseAdmin
                .from('SessionMemory')
                .select('*')
                .eq('sessionId', s.id)
            return { ...s, memories: sessionMemories || [] }
        })
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                        Therapy <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x">Sessions</span>
                    </h1>
                    <p className="text-neutral-500 mt-2 text-lg">Session history for <span className="font-bold text-neutral-800">{patient.name}</span></p>
                </div>
            </div>

            {sessions.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {sessions.map((s, index) => (
                        <Link
                            key={s.id}
                            href={`/dashboard/sessions/${s.id}`}
                            className="group bg-white rounded-3xl p-6 shadow-sm-soft border border-neutral-100 hover:shadow-xl hover:border-primary-100 transition-all duration-300 flex flex-col md:flex-row items-start md:items-center gap-6"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Date Badge */}
                            <div className="flex-shrink-0 bg-neutral-50 rounded-2xl p-4 text-center min-w-[90px] group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors border border-neutral-100 group-hover:border-primary-100">
                                <div className="text-2xl font-extrabold text-neutral-900 group-hover:text-primary-700">
                                    {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric' })}
                                </div>
                                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider group-hover:text-primary-400">
                                    {new Date(s.date).toLocaleDateString('en-IN', { month: 'short' })}
                                </div>
                            </div>

                            {/* Session Info */}
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-100">
                                        {getMoodEmoji(s.mood)} {s.mood.charAt(0).toUpperCase() + s.mood.slice(1)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 text-neutral-600 text-sm font-bold border border-neutral-100">
                                        <Clock size={14} /> {s.duration} min
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-500">
                                    <span className="flex items-center gap-1.5 align-middle">
                                        <Brain size={16} className="text-primary-500" />
                                        <strong className="text-neutral-900">{s.memories.length}</strong> Memories Recall
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-neutral-300 hidden md:block"></span>
                                    <span className="flex items-center gap-1.5 align-middle">
                                        <Activity size={16} className="text-orange-500" />
                                        <strong className="text-neutral-900">{getAvgRecallScore(s.memories)}%</strong> Avg Score
                                    </span>
                                </div>

                                {s.notes && (
                                    <p className="text-neutral-600 text-sm line-clamp-1 italic group-hover:text-neutral-900 transition-colors">
                                        "{s.notes}"
                                    </p>
                                )}
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex w-12 h-12 rounded-full bg-neutral-50 text-neutral-400 items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all transform group-hover:translate-x-2">
                                <ChevronRight size={24} />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm-soft border border-neutral-100 max-w-2xl mx-auto">
                    <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
                        <MessageSquare size={40} />
                    </div>
                    <h2 className="text-2xl font-extrabold text-neutral-900 mb-2">No Sessions Recorded</h2>
                    <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                        Therapy sessions will appear here after they are completed on the mobile app.
                    </p>
                </div>
            )}
        </div>
    )
}
