// Memory Detail Page
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import ImageSlideshow from '@/app/dashboard/components/ImageSlideshow'
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Sparkles,
    Lightbulb,
    Star
} from 'lucide-react'


export default async function MemoryDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession()
    if (!session) redirect('/login')

    const { id } = await params

    // Get memory with patient info
    const { data: memory, error } = await supabaseAdmin
        .from('Memory')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !memory) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6 text-neutral-400">
                    <Sparkles size={32} />
                </div>
                <h2 className="text-2xl font-extrabold text-neutral-900 mb-2">Memory Not Found</h2>
                <p className="text-neutral-500 mb-8 max-w-sm">
                    This memory may have been deleted or you don't have permission to view it.
                </p>
                <Link href="/dashboard/memories" className="inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-neutral-800 transition-colors">
                    <ArrowLeft size={18} />
                    Return to Gallery
                </Link>
            </div>
        )
    }

    // Get patient to verify ownership
    const { data: patient } = await supabaseAdmin
        .from('Patient')
        .select('*')
        .eq('id', memory.patientId)
        .single()

    if (!patient || patient.caregiverId !== session.userId) {
        return <div className="text-red-500 font-bold text-center py-20 bg-red-50 rounded-2xl mx-4">Unauthorized Access</div>
    }

    const photos = memory.photoUrls || []

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
                <Link
                    href="/dashboard/memories"
                    className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-bold transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Gallery</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

                {/* Left Column: Visuals */}
                <div className="space-y-6 sticky top-24">
                    <div className="bg-neutral-900 rounded-[2rem] overflow-hidden shadow-2xl shadow-neutral-900/20 aspect-[4/3] ring-4 ring-white">
                        <ImageSlideshow images={photos} title={memory.title} />
                    </div>

                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                        <div className="relative z-10 flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200">
                                <Lightbulb size={24} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-amber-900 mb-2">Clinical Tip</h3>
                                <p className="text-amber-800/80 leading-relaxed font-medium">
                                    Help <strong>{patient.name}</strong> recall by asking:
                                    <br />
                                    <span className="italic block mt-1 text-amber-900 border-l-2 border-amber-300 pl-3 py-1">"Do you remember who was with us at the {memory.event}?"</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm-soft border border-neutral-100 space-y-8">
                    <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold uppercase tracking-wider border border-primary-100">
                                {memory.event}
                            </span>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={16}
                                        className={star <= memory.importance ? "fill-amber-400 text-amber-400" : "text-neutral-200"}
                                    />
                                ))}
                            </div>
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight mb-4">
                            {memory.title}
                        </h1>

                        <div className="flex items-center gap-2 text-neutral-500 font-medium">
                            <Calendar size={18} />
                            <span>{new Date(memory.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>

                    <div className="prose prose-neutral prose-lg max-w-none">
                        <p className="text-neutral-600 leading-relaxed">
                            {memory.description || <span className="text-neutral-400 italic">No detailed description added yet.</span>}
                        </p>
                    </div>

                    <div className="h-px bg-neutral-100 w-full"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Location</label>
                            <div className="flex items-center gap-3 text-neutral-900 font-bold">
                                <div className="w-8 h-8 rounded-full bg-white text-rose-500 flex items-center justify-center shadow-sm">
                                    <MapPin size={16} />
                                </div>
                                {memory.location}
                            </div>
                        </div>
                        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">People Tagged</label>
                            <div className="flex items-center gap-3 text-neutral-900 font-bold">
                                <div className="w-8 h-8 rounded-full bg-white text-indigo-500 flex items-center justify-center shadow-sm">
                                    <Users size={16} />
                                </div>
                                {memory.people}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
