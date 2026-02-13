// Family Members Page
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { UserPlus, User, Edit2, Camera, Users, Heart, ArrowRight } from 'lucide-react'

export default async function FamilyPage() {
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
                    <div className="relative mb-8 group">
                        <div className="absolute inset-0 bg-violet-200 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-violet-100 relative z-10 border border-white/50">
                            <UserPlus size={40} className="text-violet-400" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No Patient Added Yet</h2>
                    <p className="text-slate-500 mb-8 text-center max-w-md text-lg leading-relaxed">
                        Add a patient first to manage their family circle and memories.
                    </p>
                    <Link href="/dashboard/patients/new" className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-slate-200">
                        Add Patient
                    </Link>
                </div>
            )
        }
        patient = firstPatient
    }

    // Get family members
    const { data: familyMembers } = await supabaseAdmin
        .from('FamilyMember')
        .select('*')
        .eq('patientId', patient.id)
        .order('name', { ascending: true })

    const members = familyMembers || []

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-black uppercase tracking-widest border border-violet-100">
                            Inner Circle
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Family <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x">Members</span>
                    </h1>
                    <p className="text-slate-500 mt-3 text-lg font-medium max-w-xl">
                        Key people for <span className="font-bold text-slate-800">{patient.name}</span> to recognize and remember.
                    </p>
                </div>

                <Link href="/dashboard/family/new" className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                    <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
                    <span>Add Member</span>
                </Link>
            </div>

            {members.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {members.map((member, index) => {
                        const photoUrls = member.photoUrls || []
                        return (
                            <Link
                                key={member.id}
                                href={`/dashboard/family/${member.id}/edit`}
                                className="group relative glass-card bg-violet-50/40 rounded-[2.5rem] p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:bg-violet-50/60 flex flex-col h-full"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="relative">
                                        <div className="absolute -inset-2 bg-gradient-to-br from-violet-200 to-purple-200 rounded-[2rem] blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                        <div className="relative w-24 h-24 rounded-[1.8rem] overflow-hidden bg-white ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                                            {photoUrls.length > 0 ? (
                                                <img src={photoUrls[0]} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-50 text-violet-300">
                                                    <User size={32} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white/60 hover:bg-white p-3 rounded-2xl text-violet-400 hover:text-violet-600 transition-all shadow-sm group-hover:shadow-md backdrop-blur-sm">
                                        <Edit2 size={20} />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-violet-600 transition-colors tracking-tight">
                                        {member.name}
                                    </h3>
                                    <span className="px-3 py-1.5 bg-white/60 text-slate-600 rounded-xl text-sm font-bold border border-white/50 inline-flex items-center gap-1.5 shadow-sm">
                                        <Heart size={12} className="text-violet-500 fill-violet-500" />
                                        {member.relationship}
                                    </span>
                                </div>

                                {member.notes && (
                                    <div className="bg-white/40 rounded-2xl p-4 mb-6 backdrop-blur-sm border border-white/40 flex-grow">
                                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium">
                                            "{member.notes}"
                                        </p>
                                    </div>
                                )}

                                <div className="mt-auto pt-6 border-t border-violet-100/50 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-violet-500 shadow-sm">
                                            <Camera size={14} />
                                        </div>
                                        <span>{photoUrls.length} Photos</span>
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-white/0 group-hover:bg-violet-500 flex items-center justify-center text-transparent group-hover:text-white transition-all transform group-hover:rotate-[-45deg]">
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <div className="relative rounded-[2.5rem] overflow-hidden bg-white/40 backdrop-blur-md border border-white/60 p-16 text-center shadow-lg max-w-2xl mx-auto mt-12 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl -z-10 group-hover:bg-violet-200/30 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-200/20 rounded-full blur-3xl -z-10 group-hover:bg-fuchsia-200/30 transition-colors"></div>

                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-100/50 rotate-3 transition-transform group-hover:rotate-6 group-hover:scale-110 duration-500">
                        <Users size={40} className="text-violet-500" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">No Family Members Yet</h2>
                    <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                        Add family members with their photos to enable face recognition features during therapy sessions.
                    </p>

                    <Link href="/dashboard/family/new" className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-purple-200 transition-all hover:scale-105 hover:shadow-purple-300 hover:text-white">
                        <UserPlus size={24} />
                        <span>Add First Family Member</span>
                    </Link>
                </div>
            )}
        </div>
    )
}
