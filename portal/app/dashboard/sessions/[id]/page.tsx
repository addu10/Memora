// Session Detail Page
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect, notFound } from 'next/navigation'
import {
    ArrowLeft,
    Clock,
    Brain,
    Activity,
    Calendar,
    MapPin,
    MessageCircle
} from 'lucide-react'

export default async function SessionDetailPage({
    params
}: {
    params: { id: string }
}) {
    const session = await getSession()
    if (!session) redirect('/login')

    const { id } = await params

    // Get therapy session
    const { data: therapySession, error } = await supabaseAdmin
        .from('TherapySession')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !therapySession) {
        notFound()
    }

    // Get patient to verify ownership
    const { data: patient } = await supabaseAdmin
        .from('Patient')
        .select('*')
        .eq('id', therapySession.patientId)
        .single()

    if (!patient || patient.caregiverId !== session.userId) {
        notFound()
    }

    // Get session memories with their full memory details
    const { data: sessionMemoriesRaw } = await supabaseAdmin
        .from('SessionMemory')
        .select('*')
        .eq('sessionId', id)

    const sessionMemories = await Promise.all(
        (sessionMemoriesRaw || []).map(async (sm) => {
            const { data: memory } = await supabaseAdmin
                .from('Memory')
                .select('*')
                .eq('id', sm.memoryId)
                .single()

            // Get Photos for this memory
            const { data: photos } = await supabaseAdmin
                .from('MemoryPhoto')
                .select('*')
                .eq('memoryId', sm.memoryId)
                .order('photoIndex', { ascending: true })

            return {
                ...sm,
                memory: memory || {},
                photos: photos || []
            }
        })
    )

    const totalPictures = sessionMemories.reduce((sum, sm) => sum + sm.photos.length, 0)
    const sessionTime = new Date(therapySession.date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata'
    })

    const moodColors: Record<string, string> = {
        happy: 'text-emerald-500 bg-emerald-50 border-emerald-100',
        neutral: 'text-neutral-500 bg-neutral-50 border-neutral-100',
        sad: 'text-blue-500 bg-blue-50 border-blue-100',
        confused: 'text-amber-500 bg-amber-50 border-amber-100'
    }

    const moodColor = moodColors[therapySession.mood] || 'text-neutral-500 bg-neutral-50 border-neutral-100'

    const moodEmoji = {
        happy: '😊',
        neutral: '😐',
        sad: '😢',
        confused: '😕'
    }[therapySession.mood as string] || '🙂'

    const avgRecall = sessionMemories.length > 0
        ? (sessionMemories.reduce((sum, m) => sum + m.recallScore, 0) / sessionMemories.length).toFixed(1)
        : '--'

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header Navigation */}
            <Link
                href="/dashboard/sessions"
                className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-bold transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Back to Sessions</span>
            </Link>

            {/* Session Overview Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-indigo-100/50 border border-white/50 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-50/50 to-indigo-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    {/* Date Block */}
                    <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-3xl p-6 text-center min-w-[120px] shadow-sm border border-white/50">
                        <div className="text-4xl font-extrabold text-neutral-900">
                            {new Date(therapySession.date).toLocaleDateString('en-IN', { day: 'numeric', timeZone: 'Asia/Kolkata' })}
                        </div>
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mt-1">
                            {new Date(therapySession.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}
                        </div>
                        <div className="text-sm font-black text-indigo-600 mt-2 bg-indigo-50 py-1 rounded-lg">
                            {sessionTime}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                            Therapy Session with {patient.name}
                        </h1>

                        <div className="flex flex-wrap gap-3">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border ${moodColor}`}>
                                <span className="text-lg">{moodEmoji}</span>
                                <span className="capitalize">{therapySession.mood}</span>
                            </span>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-neutral-600 text-sm font-bold border border-neutral-200">
                                <Clock size={16} />
                                <span>{therapySession.duration}m Duration</span>
                            </span>
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-neutral-600 text-sm font-bold border border-neutral-200">
                                <Activity size={16} className="text-orange-500" />
                                <span>Recall Score: {avgRecall}/5</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm-soft border border-neutral-100 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <MessageCircle size={28} />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-neutral-900">{totalPictures}</div>
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Pictures Reviewed</div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm-soft border border-neutral-100 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                        <Activity size={28} />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-neutral-900">{avgRecall}</div>
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Avg Recall Score</div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm-soft border border-neutral-100 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <Clock size={28} />
                    </div>
                    <div>
                        <div className="text-3xl font-extrabold text-neutral-900">{therapySession.duration}m</div>
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Duration</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Memories Reviewed List */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm-soft border border-neutral-100">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                            <Brain size={24} className="text-primary-500" />
                            Memories Reviewed
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {sessionMemories.length > 0 ? (
                            sessionMemories.map((sm: any) => (
                                <div key={sm.id} className="group flex flex-col md:flex-row gap-6 p-4 rounded-3xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-100">
                                    <div className="w-full md:w-32 h-32 rounded-2xl bg-neutral-100 overflow-hidden flex-shrink-0 shadow-inner border border-neutral-100">
                                        {sm.photos && sm.photos.length > 0 ? (
                                            <img src={sm.photos[0].photoUrl} alt={sm.memory.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                <Brain size={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-neutral-900 group-hover:text-primary-700 transition-colors">{sm.memory.title}</h3>
                                            <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-neutral-100 shadow-sm">
                                                <span className="text-xs font-bold text-neutral-400 uppercase">Score</span>
                                                <span className={`text-sm font-extrabold ${sm.recallScore >= 4 ? 'text-emerald-500' :
                                                    sm.recallScore >= 3 ? 'text-amber-500' : 'text-rose-500'
                                                    }`}>{sm.recallScore}/5</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-xs font-medium text-neutral-500">
                                            {sm.memory.event && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {sm.memory.event}
                                                </span>
                                            )}
                                            {sm.memory.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {sm.memory.location}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-indigo-600 font-bold">
                                                <Clock size={12} />
                                                {sm.photos.length} {sm.photos.length === 1 ? 'Picture' : 'Pictures'}
                                            </span>
                                        </div>

                                        {sm.response && (
                                            <div className="bg-neutral-50/50 p-3 rounded-xl border border-neutral-100 border-l-4 border-l-primary-300 mt-2">
                                                <p className="text-sm text-neutral-600 italic">
                                                    "{sm.response}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                                <p className="text-neutral-400 font-medium">No memories were reviewed in this session</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Session Notes */}
                <div className="space-y-8">
                    {therapySession.notes && (
                        <div className="bg-white rounded-3xl p-8 shadow-sm-soft border border-neutral-100 h-fit">
                            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2 mb-6">
                                <MessageCircle size={24} className="text-primary-500" />
                                Session Notes
                            </h2>
                            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50 text-neutral-700 leading-relaxed font-medium">
                                {therapySession.notes}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
