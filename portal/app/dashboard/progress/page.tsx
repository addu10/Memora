// Progress Page - Analytics and Charts
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
    Activity,
    Calendar,
    Clock,
    TrendingUp,
    Brain,
    Smile,
    Meh,
    Frown,
    HelpCircle,
    BarChart2,
    PieChart,
    UserPlus,
    Zap,
    Download
} from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getProgressData(patientId: string) {
    // Get sessions for patient
    const { data: sessionsRaw } = await supabaseAdmin
        .from('TherapySession')
        .select('*')
        .eq('patientId', patientId)
        .order('date', { ascending: true })

    // Get all session memories for this patient's sessions
    const { data: allSessionMemories } = await supabaseAdmin
        .from('SessionMemory')
        .select(`
            *,
            Memory (
                title,
                event
            )
        `)
        .in('sessionId', (sessionsRaw || []).map(s => s.id))

    const sessions = (sessionsRaw || []).map(s => ({
        ...s,
        memories: (allSessionMemories || []).filter(sm => sm.sessionId === s.id)
    }))

    const totalSessions = sessions.length
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0)

    // Calculate mood distribution
    const moodCounts: Record<string, number> = { happy: 0, neutral: 0, sad: 0, confused: 0 }
    sessions.forEach(s => {
        if (moodCounts[s.mood] !== undefined) moodCounts[s.mood]++
    })

    // Calculate average recall scores over time
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recallOverTime = sessions.map(s => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const avgRecall = s.memories.length > 0
            ? s.memories.reduce((sum: number, m: any) => sum + m.recallScore, 0) / s.memories.length
            : 0
        return {
            date: s.date,
            time: new Date(s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' }),
            avgRecall: avgRecall.toFixed(1),
            mood: s.mood
        }
    })

    // Memory-level statistics
    const memoryStatsMap: Record<string, { title: string, event: string, totalScore: number, count: number }> = {}

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ; (allSessionMemories || []).forEach((sm: any) => {
            const memoryId = sm.memoryId
            if (!memoryStatsMap[memoryId]) {
                memoryStatsMap[memoryId] = {
                    title: sm.Memory?.title || 'Unknown',
                    event: sm.Memory?.event || 'Unknown',
                    totalScore: 0,
                    count: 0
                }
            }
            memoryStatsMap[memoryId].totalScore += sm.recallScore
            memoryStatsMap[memoryId].count += 1
        })

    const memoryStats = Object.entries(memoryStatsMap).map(([id, stats]) => ({
        id,
        ...stats,
        averageRecall: (stats.totalScore / stats.count).toFixed(1)
    })).sort((a, b) => parseFloat(a.averageRecall) - parseFloat(b.averageRecall))

    const allRecalls = (allSessionMemories || []).map(m => m.recallScore)
    const avgRecall = allRecalls.length > 0
        ? (allRecalls.reduce((a, b) => a + b, 0) / allRecalls.length).toFixed(1)
        : '0'

    // Advanced Clinical Metrics
    const memoryPerformance: Record<string, number[]> = {}
    const moodPerformance: Record<string, { totalRecall: number, count: number }> = {
        happy: { totalRecall: 0, count: 0 },
        neutral: { totalRecall: 0, count: 0 },
        sad: { totalRecall: 0, count: 0 },
        confused: { totalRecall: 0, count: 0 }
    }

    sessions.forEach(s => {
        const sessionAvgRecall = s.memories.length > 0
            ? s.memories.reduce((sum: number, m: any) => sum + m.recallScore, 0) / s.memories.length
            : null

        if (sessionAvgRecall !== null && moodPerformance[s.mood]) {
            moodPerformance[s.mood].totalRecall += sessionAvgRecall
            moodPerformance[s.mood].count += 1
        }

        s.memories.forEach((m: any) => {
            if (!memoryPerformance[m.memoryId]) memoryPerformance[m.memoryId] = []
            memoryPerformance[m.memoryId].push(m.recallScore)
        })
    })

    // Calculate Memory Decay Rate (simple slope approximation)
    const memoryDecay = Object.entries(memoryPerformance).map(([id, scores]) => {
        const first = scores[0]
        const last = scores[scores.length - 1]
        const trend = scores.length > 1 ? last - first : 0
        return { memoryId: id, trend, scoresCount: scores.length }
    })

    // Engagement Score Implementation
    const engagementScore = Math.min(100, (totalSessions * 5) + (totalDuration / 10))

    return {
        totalSessions,
        totalDuration,
        moodCounts,
        recallOverTime,
        memoryStats,
        avgRecall,
        clinicalInsights: {
            engagementScore: Math.round(engagementScore),
            memoryDecay: memoryDecay.sort((a, b) => a.trend - b.trend),
            moodCorrelation: Object.entries(moodPerformance).map(([mood, stats]) => ({
                mood,
                avgRecall: stats.count > 0 ? (stats.totalRecall / stats.count).toFixed(1) : 'N/A'
            }))
        }
    }
}

export default async function ProgressPage() {
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

    if (!patient) {
        const { data: firstPatient } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('caregiverId', session.userId)
            .limit(1)
            .single()

        if (!firstPatient) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <UserPlus size={40} className="text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No Patient Added Yet</h2>
                    <p className="text-slate-500 mb-8 text-center max-w-md">Get started by adding a patient profile to track their progress and memories.</p>
                    <Link href="/dashboard/patients/new" className="px-8 py-4 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200">
                        Add First Patient
                    </Link>
                </div>
            )
        }
        patient = firstPatient
    }

    const progress = await getProgressData(patient.id)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                        Progress <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x">Analysis</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">
                        Clinical insights and trends for <span className="font-bold text-slate-800 border-b-2 border-violet-100">{patient.name}</span>
                    </p>
                </div>
                <Link href="/dashboard/reports" className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 shrink-0">
                    <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                    <span>Export Reports</span>
                </Link>
            </div>

            {/* Summary Stats Grid (Unified Violet Theme) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Total Sessions - Violet */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-violet-200 flex flex-col items-center text-center hover:shadow-lg hover:border-violet-300 transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors">
                        <Calendar size={28} strokeWidth={2.5} />
                    </div>
                    <div className="text-4xl font-black text-slate-900 mb-1">{progress.totalSessions}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-violet-600 transition-colors">Total Sessions</div>
                </div>

                {/* Total Minutes - Indigo */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-violet-200 flex flex-col items-center text-center hover:shadow-lg hover:border-violet-300 transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                        <Clock size={28} strokeWidth={2.5} />
                    </div>
                    <div className="text-4xl font-black text-slate-900 mb-1">{progress.totalDuration}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Total Minutes</div>
                </div>

                {/* Avg Recall - Fuchsia/Purple */}
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-violet-200 flex flex-col items-center text-center hover:shadow-lg hover:border-violet-300 transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-2xl bg-fuchsia-50 text-fuchsia-600 flex items-center justify-center mb-4 group-hover:bg-fuchsia-100 transition-colors">
                        <Activity size={28} strokeWidth={2.5} />
                    </div>
                    <div className="text-4xl font-black text-slate-900 mb-1">{progress.avgRecall}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-fuchsia-600 transition-colors">Avg. Recall</div>
                </div>

                {/* Engagement - Violet Gradient */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-[2rem] p-6 shadow-lg shadow-violet-200 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-white">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-4 group-hover:bg-white/30 transition-colors">
                        <Zap size={28} strokeWidth={2.5} />
                    </div>
                    <div className="text-4xl font-black mb-1">{progress.clinicalInsights.engagementScore}%</div>
                    <div className="text-xs font-bold opacity-80 uppercase tracking-wider">Engagement Score</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Charts */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Recall Progress */}
                    {progress.recallOverTime.length > 0 && (
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-violet-200">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-sm">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Recall Trend</h2>
                                    <p className="text-sm text-slate-500 font-medium">Cognitive performance over last 10 sessions</p>
                                </div>
                            </div>

                            <div className="h-64 flex items-end justify-between gap-3 px-2 pb-2">
                                {progress.recallOverTime.slice(-10).map((item, i) => (
                                    <div key={i} className="flex flex-col items-center gap-3 group w-full">
                                        <div className="relative w-full flex justify-end flex-col items-center h-48">
                                            <div
                                                className="w-full max-w-[40px] bg-violet-600 rounded-t-xl group-hover:bg-violet-700 transition-all duration-300 relative shadow-sm"
                                                style={{ height: `${(parseFloat(item.avgRecall) / 5) * 100}%` }}
                                            >
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap z-20">
                                                    {item.time} • {item.avgRecall}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-slate-400 group-hover:text-violet-600 transition-colors truncate w-full text-center">
                                            {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Memory Performance */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-violet-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-sm">
                                <Brain size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Memory Support Analysis</h2>
                                <p className="text-sm text-slate-500 font-medium">Recall strength for specific memories</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {progress.memoryStats.length > 0 ? (
                                <div className="grid gap-3">
                                    {progress.memoryStats.map((stat, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all duration-200 group">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className="font-bold text-slate-900 truncate group-hover:text-violet-700 transition-colors">{stat.title}</h4>
                                                <p className="text-sm text-slate-500 truncate">{stat.event}</p>
                                            </div>
                                            <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm ${parseFloat(stat.averageRecall) > 4
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : parseFloat(stat.averageRecall) > 2.5
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                <span>{stat.averageRecall}</span>
                                                <span className="opacity-50 text-xs text-current">/ 5</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    No data available yet. Complete a session to see analysis.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Mood Distribution */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-violet-200 h-full relative overflow-hidden">
                        {/* Decorative Blur */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50/50 rounded-full blur-3xl -z-10"></div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                                <PieChart size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Emotional Wellbeing</h2>
                                <p className="text-sm text-slate-500 font-medium">Mood distribution</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Happy', key: 'happy', color: 'bg-emerald-500', icon: Smile, text: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Neutral', key: 'neutral', color: 'bg-slate-400', icon: Meh, text: 'text-slate-600', bg: 'bg-slate-50' },
                                { label: 'Sad', key: 'sad', color: 'bg-blue-500', icon: Frown, text: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Confused', key: 'confused', color: 'bg-amber-500', icon: HelpCircle, text: 'text-amber-600', bg: 'bg-amber-50' }
                            ].map(m => (
                                <div key={m.key} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm font-bold">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg ${m.bg}`}>
                                                <m.icon size={16} className={m.text} />
                                            </div>
                                            <span className="text-slate-700">{m.label}</span>
                                        </div>
                                        <span className="text-slate-900 bg-slate-50 px-2.5 py-1 rounded-md min-w-[30px] text-center">{progress.moodCounts[m.key]}</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${m.color} transition-all duration-1000 ease-out shadow-sm`}
                                            style={{
                                                width: `${(progress.moodCounts[m.key] / Math.max(progress.totalSessions, 1)) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* <div className="mt-8 p-6 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl border border-violet-100">
                            <h4 className="font-bold text-violet-900 mb-2 flex items-center gap-2">
                                <Zap size={18} className="fill-violet-600 text-violet-600" />
                                Insight
                            </h4>
                            <p className="text-sm text-violet-700/80 leading-relaxed font-medium">
                                Tracking emotional patterns helps identify triggers and effective memory recall strategies. Consistent positive sessions indicate effective therapy.
                            </p>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}
