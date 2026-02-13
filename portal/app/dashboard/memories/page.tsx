// Memories Page - Gallery and Upload
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { Image as ImageIcon, Plus, Calendar, Users, Star, ArrowRight } from 'lucide-react'
import MemoryGallery from '@/app/dashboard/memories/MemoryGallery'

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

    const memoryList = (memories || []).map(m => ({
        ...m,
        importance: m.importance || 0,
        description: m.description || '',
        photoUrls: m.photoUrls || []
    }))

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

            <MemoryGallery memories={memoryList} patientName={patient.name} />
        </div>
    )
}
