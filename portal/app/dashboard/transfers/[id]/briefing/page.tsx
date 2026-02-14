'use client'

// Patient Briefing Slideshow — Immersive onboarding for the receiving caregiver
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    ArrowRight,
    User,
    Heart,
    Brain,
    Camera,
    Users,
    Activity,
    TrendingUp,
    CheckCircle2,
    Clock,
    Calendar,
    Star,
    MessageSquare,
    Loader2,
    AlertCircle,
    Smile,
    Meh,
    Frown,
    ChevronLeft,
    Home
} from 'lucide-react'

// ————————————————————————————————————————————
// Types
// ————————————————————————————————————————————
interface BriefingData {
    transfer: {
        id: string
        status: string
        message: string | null
        createdAt: string
        expiresAt: string
    }
    sender: { name: string; email: string } | null
    patient: {
        name: string
        age: number
        diagnosis: string
        mmseScore: number | null
        notes: string | null
        photoUrl: string | null
        createdAt: string
    }
    memories: Array<{
        id: string
        title: string
        description: string
        date: string
        importance: number
        event: string
        photos: Array<{ id: string; photoUrl: string; description: string | null; photoIndex: number | null }>
    }>
    familyMembers: Array<{
        id: string
        name: string
        relationship: string
        photoUrls: string[] | null
        notes: string | null
    }>
    sessions: Array<{
        id: string
        date: string
        duration: number
        mood: string
        notes: string | null
        completed: boolean
        memoriesReviewed: number
        avgRecallScore: number
    }>
    insights: {
        totalSessions: number
        completedSessions: number
        avgDuration: number
        avgRecallScore: number
        totalMemories: number
        totalFamilyMembers: number
        moodDistribution: Record<string, number>
        highImportanceMemories: number
    }
}

// ————————————————————————————————————————————
// Helpers
// ————————————————————————————————————————————
function getMoodIcon(mood: string) {
    switch (mood?.toLowerCase()) {
        case 'happy': return <Smile size={16} className="text-emerald-500" />
        case 'neutral': return <Meh size={16} className="text-amber-500" />
        case 'sad':
        case 'confused':
        case 'agitated': return <Frown size={16} className="text-red-500" />
        default: return <Meh size={16} className="text-neutral-400" />
    }
}

function getMoodColor(mood: string) {
    switch (mood?.toLowerCase()) {
        case 'happy': return 'bg-emerald-500'
        case 'neutral': return 'bg-amber-500'
        case 'sad': return 'bg-blue-500'
        case 'confused': return 'bg-purple-500'
        case 'agitated': return 'bg-red-500'
        default: return 'bg-neutral-400'
    }
}

function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    })
}

function getImportanceStars(n: number) {
    return Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12} className={i < n ? 'text-amber-400 fill-amber-400' : 'text-neutral-200'} />
    ))
}

// ————————————————————————————————————————————
// Main Component
// ————————————————————————————————————————————
export default function BriefingPage({ params }: { params: { id: string } }) {
    const { id } = params
    const router = useRouter()
    const [data, setData] = useState<BriefingData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentSlide, setCurrentSlide] = useState(0)

    const TOTAL_SLIDES = 7

    useEffect(() => {
        async function fetchBriefing() {
            try {
                const res = await fetch(`/api/transfers/${id}/briefing`)
                const json = await res.json()
                if (!res.ok) throw new Error(json.error || 'Failed to load briefing')
                setData(json)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchBriefing()
    }, [id])

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => Math.min(prev + 1, TOTAL_SLIDES - 1))
    }, [])

    const prevSlide = useCallback(() => {
        setCurrentSlide(prev => Math.max(prev - 1, 0))
    }, [])

    // Keyboard navigation
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide()
            if (e.key === 'ArrowLeft') prevSlide()
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [nextSlide, prevSlide])

    // ————————————————————————————————————————————
    // Loading / Error
    // ————————————————————————————————————————————
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-indigo-500 mx-auto mb-4" />
                    <p className="text-neutral-500 font-medium">Preparing patient briefing...</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="text-center max-w-md mx-auto p-8">
                    <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-neutral-900 mb-2">Unable to Load Briefing</h2>
                    <p className="text-neutral-500 mb-6">{error || 'Something went wrong'}</p>
                    <Link href="/dashboard/transfers" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors">
                        ← Back to Transfers
                    </Link>
                </div>
            </div>
        )
    }

    // ————————————————————————————————————————————
    // Slide Definitions
    // ————————————————————————————————————————————
    const slideLabels = [
        'Welcome',
        'Medical Profile',
        'Memory Gallery',
        'Family & Friends',
        'Therapy History',
        'Progress Insights',
        'Handoff Complete'
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-white/60 backdrop-blur-sm sticky top-0 z-50">
                <Link href="/dashboard/transfers" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors text-sm font-bold">
                    <ChevronLeft size={18} /> Back to Transfers
                </Link>
                <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Patient Briefing
                </div>
                <div className="text-sm font-bold text-neutral-600">
                    {currentSlide + 1} / {TOTAL_SLIDES}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-neutral-100">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${((currentSlide + 1) / TOTAL_SLIDES) * 100}%` }}
                />
            </div>

            {/* Slide Content */}
            <main className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-4xl animate-in fade-in duration-300" key={currentSlide}>
                    {currentSlide === 0 && <SlideWelcome data={data} />}
                    {currentSlide === 1 && <SlideMedical data={data} />}
                    {currentSlide === 2 && <SlideMemories data={data} />}
                    {currentSlide === 3 && <SlideFamily data={data} />}
                    {currentSlide === 4 && <SlideSessions data={data} />}
                    {currentSlide === 5 && <SlideInsights data={data} />}
                    {currentSlide === 6 && <SlideComplete data={data} transferId={id} />}
                </div>
            </main>

            {/* Navigation Footer */}
            <footer className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-white/60 backdrop-blur-sm sticky bottom-0">
                {/* Slide Dots */}
                <div className="flex items-center gap-1.5">
                    {slideLabels.map((label, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            title={label}
                            className={`transition-all duration-300 rounded-full ${i === currentSlide
                                ? 'w-8 h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500'
                                : i < currentSlide
                                    ? 'w-2.5 h-2.5 bg-indigo-300 hover:bg-indigo-400'
                                    : 'w-2.5 h-2.5 bg-neutral-200 hover:bg-neutral-300'
                                }`}
                        />
                    ))}
                </div>

                {/* Nav Buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="px-4 py-2.5 rounded-xl font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                    >
                        <ArrowLeft size={16} /> Previous
                    </button>
                    {currentSlide < TOTAL_SLIDES - 1 ? (
                        <button
                            onClick={nextSlide}
                            className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 text-sm"
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    ) : (
                        <Link
                            href="/dashboard/transfers"
                            className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2 text-sm"
                        >
                            <Home size={16} /> Back to Transfers
                        </Link>
                    )}
                </div>
            </footer>
        </div>
    )
}

// ————————————————————————————————————————————
// Slide 1: Welcome
// ————————————————————————————————————————————
function SlideWelcome({ data }: { data: BriefingData }) {
    return (
        <div className="text-center max-w-xl mx-auto">
            {/* Patient Avatar */}
            <div className="mb-8">
                {data.patient.photoUrl ? (
                    <img
                        src={data.patient.photoUrl}
                        alt={data.patient.name}
                        className="w-32 h-32 rounded-full object-cover mx-auto shadow-2xl shadow-indigo-500/20 ring-4 ring-white"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-5xl font-bold mx-auto shadow-2xl shadow-indigo-500/20 ring-4 ring-white">
                        {data.patient.name[0]}
                    </div>
                )}
            </div>

            <p className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-3">Patient Transfer Briefing</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4">
                You&apos;re receiving care of
            </h1>
            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
                {data.patient.name}
            </h2>

            {/* Sender Info */}
            {data.sender && (
                <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm inline-block">
                    <p className="text-neutral-500 text-sm">
                        Transferred by <span className="font-bold text-neutral-900">{data.sender.name}</span>
                    </p>
                    <p className="text-neutral-400 text-xs mt-1">{data.sender.email}</p>
                </div>
            )}

            {/* Transfer Message */}
            {data.transfer.message && (
                <div className="mt-6 bg-indigo-50 rounded-2xl p-5 border border-indigo-100 max-w-md mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={16} className="text-indigo-400" />
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Message from sender</span>
                    </div>
                    <p className="text-indigo-700 font-medium italic">&ldquo;{data.transfer.message}&rdquo;</p>
                </div>
            )}

            <p className="text-neutral-400 text-sm mt-8">Use the arrows or press ← → to navigate through the briefing</p>
        </div>
    )
}

// ————————————————————————————————————————————
// Slide 2: Medical Profile
// ————————————————————————————————————————————
function SlideMedical({ data }: { data: BriefingData }) {
    const p = data.patient
    return (
        <div>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-sm font-bold mb-4">
                    <Brain size={16} /> Medical Profile
                </div>
                <h2 className="text-3xl font-extrabold text-neutral-900">{p.name}&apos;s Health Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {/* Age */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Age</div>
                    <div className="text-3xl font-extrabold text-neutral-900">{p.age || '—'} <span className="text-lg font-bold text-neutral-400">years</span></div>
                </div>

                {/* MMSE Score */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">MMSE Score</div>
                    <div className="text-3xl font-extrabold text-neutral-900">
                        {p.mmseScore !== null ? p.mmseScore : '—'}
                        <span className="text-lg font-bold text-neutral-400"> / 30</span>
                    </div>
                    {p.mmseScore !== null && (
                        <div className="mt-2 w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${p.mmseScore >= 24 ? 'bg-emerald-500' : p.mmseScore >= 18 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${(p.mmseScore / 30) * 100}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Diagnosis */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm md:col-span-2 lg:col-span-1">
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Diagnosis</div>
                    <div className="text-lg font-bold text-neutral-900">{p.diagnosis || 'Not specified'}</div>
                </div>

                {/* Patient Since */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm">
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Patient Since</div>
                    <div className="text-lg font-bold text-neutral-900">{formatDate(p.createdAt)}</div>
                </div>

                {/* Clinical Notes */}
                {p.notes && (
                    <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm md:col-span-2">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Clinical Notes</div>
                        <p className="text-neutral-700 font-medium leading-relaxed">{p.notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

// ————————————————————————————————————————————
// Slide 3: Memory Gallery
// ————————————————————————————————————————————
function SlideMemories({ data }: { data: BriefingData }) {
    return (
        <div>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full text-amber-600 text-sm font-bold mb-4">
                    <Camera size={16} /> Memory Gallery
                </div>
                <h2 className="text-3xl font-extrabold text-neutral-900">{data.insights.totalMemories} Memories</h2>
                <p className="text-neutral-500 mt-1">{data.insights.highImportanceMemories} are high importance (★4+)</p>
            </div>

            {data.memories.length === 0 ? (
                <div className="text-center text-neutral-400 py-12 bg-white rounded-2xl border border-neutral-100">
                    No memories recorded yet
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto max-h-[55vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                    {data.memories.map(memory => (
                        <div key={memory.id} className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                            {/* Photo thumbnail */}
                            {memory.photos.length > 0 && (
                                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                                    {memory.photos.slice(0, 3).map(photo => (
                                        <img
                                            key={photo.id}
                                            src={photo.photoUrl}
                                            alt={photo.description || memory.title}
                                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-100"
                                        />
                                    ))}
                                    {memory.photos.length > 3 && (
                                        <div className="w-16 h-16 rounded-xl bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500 shrink-0">
                                            +{memory.photos.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}

                            <h3 className="font-bold text-neutral-900 text-sm">{memory.title}</h3>
                            {memory.description && (
                                <p className="text-neutral-500 text-xs mt-1 line-clamp-2">{memory.description}</p>
                            )}

                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-0.5">{getImportanceStars(memory.importance || 3)}</div>
                                <span className="text-xs text-neutral-400">{memory.date ? formatDate(memory.date) : 'No date'}</span>
                            </div>

                            {memory.event && (
                                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                                    {memory.event}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ————————————————————————————————————————————
// Slide 4: Family & Friends
// ————————————————————————————————————————————
function SlideFamily({ data }: { data: BriefingData }) {
    return (
        <div>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-full text-rose-600 text-sm font-bold mb-4">
                    <Heart size={16} /> Family & Friends
                </div>
                <h2 className="text-3xl font-extrabold text-neutral-900">{data.insights.totalFamilyMembers} Family Members</h2>
            </div>

            {data.familyMembers.length === 0 ? (
                <div className="text-center text-neutral-400 py-12 bg-white rounded-2xl border border-neutral-100">
                    No family members recorded yet
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {data.familyMembers.map(member => (
                        <div key={member.id} className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm text-center hover:shadow-md transition-shadow">
                            {/* Avatar */}
                            {member.photoUrls && member.photoUrls.length > 0 ? (
                                <img
                                    src={member.photoUrls[0]}
                                    alt={member.name}
                                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3 ring-2 ring-rose-100"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3 ring-2 ring-rose-100">
                                    {member.name[0]}
                                </div>
                            )}

                            <h3 className="font-bold text-neutral-900">{member.name}</h3>
                            <p className="text-sm text-neutral-500 capitalize">{member.relationship}</p>
                            {member.notes && (
                                <p className="text-xs text-neutral-400 mt-2 line-clamp-2">{member.notes}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ————————————————————————————————————————————
// Slide 5: Therapy History
// ————————————————————————————————————————————
function SlideSessions({ data }: { data: BriefingData }) {
    return (
        <div>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full text-teal-600 text-sm font-bold mb-4">
                    <Activity size={16} /> Therapy History
                </div>
                <h2 className="text-3xl font-extrabold text-neutral-900">{data.insights.totalSessions} Sessions</h2>
                <p className="text-neutral-500 mt-1">
                    {data.insights.completedSessions} completed · {data.insights.avgDuration} min avg
                </p>
            </div>

            {data.sessions.length === 0 ? (
                <div className="text-center text-neutral-400 py-12 bg-white rounded-2xl border border-neutral-100">
                    No therapy sessions recorded yet
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-2xl p-4 border border-neutral-100 text-center">
                            <div className="text-2xl font-extrabold text-teal-600">{data.insights.totalSessions}</div>
                            <div className="text-xs font-bold text-neutral-400 uppercase">Total</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-neutral-100 text-center">
                            <div className="text-2xl font-extrabold text-indigo-600">{data.insights.avgDuration}<span className="text-sm">m</span></div>
                            <div className="text-xs font-bold text-neutral-400 uppercase">Avg Duration</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 border border-neutral-100 text-center">
                            <div className="text-2xl font-extrabold text-amber-600">{data.insights.avgRecallScore}</div>
                            <div className="text-xs font-bold text-neutral-400 uppercase">Avg Recall</div>
                        </div>
                    </div>

                    {/* Recent Sessions (scrollable) */}
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                        {data.sessions.slice(0, 10).map(session => (
                            <div key={session.id} className="bg-white rounded-xl p-4 border border-neutral-100 flex items-center gap-4">
                                <div className="flex items-center gap-2 shrink-0">
                                    {getMoodIcon(session.mood)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-neutral-900 text-sm">{formatDate(session.date)}</span>
                                        {session.completed && <CheckCircle2 size={14} className="text-emerald-500" />}
                                    </div>
                                    <p className="text-xs text-neutral-500">
                                        {session.duration}min · {session.memoriesReviewed} memories · Recall: {session.avgRecallScore}/5
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-neutral-400 capitalize px-2 py-1 rounded-full bg-neutral-50">
                                    {session.mood}
                                </span>
                            </div>
                        ))}
                        {data.sessions.length > 10 && (
                            <p className="text-center text-xs text-neutral-400 py-2">
                                + {data.sessions.length - 10} more sessions
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

// ————————————————————————————————————————————
// Slide 6: Progress Insights
// ————————————————————————————————————————————
function SlideInsights({ data }: { data: BriefingData }) {
    const { insights } = data
    const totalMoods = Object.values(insights.moodDistribution).reduce((a, b) => a + b, 0)

    return (
        <div>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-purple-600 text-sm font-bold mb-4">
                    <TrendingUp size={16} /> Progress Insights
                </div>
                <h2 className="text-3xl font-extrabold text-neutral-900">At a Glance</h2>
            </div>

            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Summary Stats */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Summary</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-600 font-medium">Total Memories</span>
                            <span className="font-extrabold text-neutral-900">{insights.totalMemories}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-600 font-medium">High Priority</span>
                            <span className="font-extrabold text-amber-600">{insights.highImportanceMemories}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-600 font-medium">Family Members</span>
                            <span className="font-extrabold text-neutral-900">{insights.totalFamilyMembers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-600 font-medium">Sessions Completed</span>
                            <span className="font-extrabold text-neutral-900">{insights.completedSessions} / {insights.totalSessions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-neutral-600 font-medium">Avg Recall Score</span>
                            <span className="font-extrabold text-indigo-600">{insights.avgRecallScore} / 5</span>
                        </div>
                    </div>
                </div>

                {/* Mood Distribution */}
                <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Mood Distribution</h3>
                    {totalMoods === 0 ? (
                        <p className="text-neutral-400 text-sm">No mood data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {Object.entries(insights.moodDistribution)
                                .sort((a, b) => b[1] - a[1])
                                .map(([mood, count]) => (
                                    <div key={mood}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-neutral-600 capitalize flex items-center gap-2">
                                                {getMoodIcon(mood)} {mood}
                                            </span>
                                            <span className="font-bold text-neutral-900">{count} ({Math.round((count / totalMoods) * 100)}%)</span>
                                        </div>
                                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${getMoodColor(mood)} transition-all duration-500`}
                                                style={{ width: `${(count / totalMoods) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ————————————————————————————————————————————
// Slide 7: Handoff Complete
// ————————————————————————————————————————————
function SlideComplete({ data, transferId }: { data: BriefingData; transferId: string }) {
    return (
        <div className="text-center max-w-xl mx-auto">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
                <CheckCircle2 size={48} />
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-3">Briefing Complete</h2>
            <p className="text-neutral-500 text-lg mb-8">
                You now have a full overview of <strong className="text-neutral-900">{data.patient.name}</strong>&apos;s care history.
            </p>

            {data.transfer.status === 'pending' && (
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 mb-8 max-w-md mx-auto">
                    <p className="text-amber-700 text-sm font-medium">
                        <strong>Note:</strong> This transfer is still pending. Go back to the Transfer Center to accept or reject it.
                    </p>
                </div>
            )}

            {data.transfer.status === 'accepted' && (
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 mb-8 max-w-md mx-auto">
                    <p className="text-emerald-700 text-sm font-medium">
                        <strong>Transfer accepted!</strong> {data.patient.name} is now under your care. You&apos;ll find them on your dashboard.
                    </p>
                </div>
            )}

            <div className="flex items-center justify-center gap-4">
                <Link
                    href="/dashboard/transfers"
                    className="px-6 py-3 rounded-xl font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                >
                    Transfer Center
                </Link>
                <Link
                    href="/dashboard"
                    className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30"
                >
                    Go to Dashboard →
                </Link>
            </div>
        </div>
    )
}
