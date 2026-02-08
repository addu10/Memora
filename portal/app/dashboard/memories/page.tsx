// Memories Page - Gallery and Upload
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Image as ImageIcon, Plus, Calendar, Users, Star, ArrowRight } from 'lucide-react'

export default async function MemoriesPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const cookieStore = await cookies()
    const patientId = cookieStore.get('selectedPatientId')?.value

    // Get first patient if none selected
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
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Users size={48} className="text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3">No Patient Selected</h2>
                    <p className="text-slate-500 max-w-md mb-8 text-lg">Add a loved one to your profile to start preserving their precious memories.</p>
                    <Link href="/dashboard/patients/new" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-indigo-200 hover:-translate-y-1">
                        <Plus size={20} /> Add Patient
                    </Link>
                </div>
            )
        }
        patient = firstPatient
    }

    // Get memories for patient
    const { data: memories } = await supabaseAdmin
        .from('Memory')
        .select('*')
        .eq('patientId', patient.id)
        .order('date', { ascending: false })

    const memoryList = memories || []

    // Group memories by event
    const eventGroups: Record<string, typeof memoryList> = {}
    memoryList.forEach(memory => {
        if (!eventGroups[memory.event]) {
            eventGroups[memory.event] = []
        }
        eventGroups[memory.event].push(memory)
    })

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* 1. Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest border border-indigo-100">
                            Gallery
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x">Memories</span>
                    </h1>
                    <p className="text-slate-500 mt-3 text-lg font-medium max-w-xl">
                        A curated reminisence gallery for <span className="font-bold text-slate-700">{patient.name}</span>.
                    </p>
                </div>

                <Link href="/dashboard/memories/new" className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span>Add New Memory</span>
                </Link>
            </div>

            {/* 2. Filters / Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide py-2">
                <button className="flex-shrink-0 px-6 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105">
                    All Memories
                </button>
                {Object.keys(eventGroups).map(event => (
                    <button key={event} className="flex-shrink-0 px-6 py-2.5 rounded-2xl bg-white/60 hover:bg-white text-slate-600 font-bold border border-white/50 shadow-sm transition-all hover:text-indigo-600 hover:shadow-md backdrop-blur-sm">
                        {event}
                    </button>
                ))}
            </div>

            {/* 3. Memories Grid or Empty State */}
            {memoryList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {memoryList.map((memory, index) => (
                        <Link
                            href={`/dashboard/memories/${memory.id}`}
                            key={memory.id}
                            className="group relative flex flex-col glass-card rounded-[2rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Image Container */}
                            <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                                {memory.photoUrls && memory.photoUrls.length > 0 ? (
                                    <img
                                        src={memory.photoUrls[0]}
                                        alt={memory.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-50/50">
                                        <ImageIcon size={48} className="text-indigo-200/50" />
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                                {/* Floating Badge */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 shadow-sm">
                                    {memory.event}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex gap-0.5">
                                        {[...Array(memory.importance || 0)].map((_, i) => (
                                            <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto">
                                        {new Date(memory.date).getFullYear()}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {memory.title}
                                </h3>

                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100/50">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                        <Users size={14} />
                                        <span className="truncate max-w-[120px]">{memory.people}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="relative rounded-[2.5rem] overflow-hidden bg-white/40 backdrop-blur-md border border-white/60 p-12 text-center shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-200/20 rounded-full blur-3xl -z-10"></div>

                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100/50 rotate-3 transition-transform hover:rotate-6">
                        <ImageIcon size={40} className="text-indigo-500" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Capture Your First Memory</h2>
                    <p className="text-slate-500 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                        "Building a bridge to the past starts with a single photo." <br />
                        Upload a photo to begin building {patient.name}'s gallery.
                    </p>

                    <Link href="/dashboard/memories/new" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all hover:scale-105 hover:shadow-indigo-300">
                        <Plus size={24} /> Add First Memory
                    </Link>
                </div>
            )}
        </div>
    )
}
