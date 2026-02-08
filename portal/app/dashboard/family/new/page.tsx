'use client'

// Add New Family Member Page
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import ImageUpload from '../../components/ImageUpload'
import { UserPlus, User, Heart, Camera, X, Plus, ChevronLeft } from 'lucide-react'

const relationshipOptions = [
    'Wife', 'Husband', 'Son', 'Daughter', 'Brother', 'Sister',
    'Father', 'Mother', 'Grandson', 'Granddaughter',
    'Son-in-law', 'Daughter-in-law', 'Nephew', 'Niece',
    'Friend', 'Neighbor', 'Caretaker', 'Other'
]

export default function NewFamilyMemberPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [photoUrls, setPhotoUrls] = useState<string[]>([''])

    const addPhotoField = () => {
        if (photoUrls.length < 10) {
            setPhotoUrls([...photoUrls, ''])
        }
    }

    const updatePhotoUrl = (index: number, value: string) => {
        const updated = [...photoUrls]
        updated[index] = value
        setPhotoUrls(updated)
    }

    const removePhotoField = (index: number) => {
        setPhotoUrls(photoUrls.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        const data = {
            name: formData.get('name'),
            relationship: formData.get('relationship'),
            photoUrls: photoUrls.filter(url => url.trim() !== ''),
            notes: formData.get('notes'),
            patientId: Cookies.get('selectedPatientId')
        }

        try {
            const res = await fetch('/api/family', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                const result = await res.json()
                throw new Error(result.error || 'Failed to add family member')
            }

            router.push('/dashboard/family')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Link href="/dashboard/family" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 font-bold mb-3 transition-colors">
                        <ChevronLeft size={20} /> Back to Family
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Add Family <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x">Member</span>
                    </h1>
                    <p className="text-slate-500 mt-3 text-lg font-medium">Add reference photos ensuring clear visibility for face recognition.</p>
                </div>
            </div>

            {error && (
                <div className="p-6 bg-red-50/80 backdrop-blur-md text-red-700 rounded-[1.5rem] flex items-center gap-3 font-bold border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                        <X size={20} />
                    </div>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card bg-white/60 rounded-[2.5rem] p-8 shadow-sm backdrop-blur-md border border-white/50">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
                                <User size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Details</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                                    Name <span className="text-violet-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-white/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none font-bold placeholder:text-slate-300 placeholder:font-medium text-slate-900 shadow-sm"
                                    placeholder="e.g., Lakshmi"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1">
                                    Relationship <span className="text-violet-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="relationship"
                                        className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-white/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none font-bold appearance-none text-slate-900 shadow-sm cursor-pointer"
                                        required
                                    >
                                        <option value="">Select relationship...</option>
                                        {relationshipOptions.map(rel => (
                                            <option key={rel} value={rel}>{rel}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-violet-400">
                                        <Heart size={20} className="fill-violet-100" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    className="w-full px-5 py-4 rounded-2xl bg-white/50 border border-white/50 focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none font-bold placeholder:text-slate-300 placeholder:font-medium min-h-[140px] resize-none text-slate-900 shadow-sm leading-relaxed"
                                    placeholder="Distinctive features (glasses, etc.) or topics to discuss/avoid..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mt-8 pt-8 border-t border-slate-100/50">
                            <Link
                                href="/dashboard/family"
                                className="flex-1 py-4 px-4 rounded-2xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="flex-1 py-4 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x hover:shadow-purple-200 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:text-white"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={20} />
                                        <span>Save Member</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Photos Grid */}
                <div className="lg:col-span-2">
                    <div className="glass-card bg-white/40 rounded-[2.5rem] p-8 shadow-sm backdrop-blur-md border border-white/50 h-full relative overflow-hidden">
                        {/* Decorative background blobs */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-100/30 rounded-full blur-3xl -z-10"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-100/30 rounded-full blur-3xl -z-10"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-[1.2rem] bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-200">
                                    <Camera size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Reference Photos</h3>
                                    <p className="text-slate-500 font-medium">Add 5-10 clear photos from different angles.</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl text-sm font-bold text-violet-600 shadow-sm">
                                {photoUrls.filter(u => u !== '').length} / 10 Photos
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                            {photoUrls.map((url, index) => (
                                <div key={index} className="relative group animate-in fade-in zoom-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                    <div className="aspect-square rounded-[1.5rem] overflow-hidden bg-white/40 border border-white/60 group-hover:border-violet-300 transition-all shadow-sm hover:shadow-md">
                                        <ImageUpload
                                            bucket="family-photos"
                                            onUpload={(newUrl) => updatePhotoUrl(index, newUrl)}
                                            label={`Photo ${index + 1}`}
                                            compact={true}
                                            currentUrl={url}
                                        />
                                    </div>
                                    {/* Remove Button */}
                                    {url && photoUrls.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePhotoField(index)}
                                            className="absolute -top-3 -right-3 w-9 h-9 bg-white text-red-500 rounded-full shadow-lg border border-red-50 flex items-center justify-center hover:bg-red-50 hover:scale-110 transition-all z-10"
                                            title="Remove photo"
                                        >
                                            <X size={16} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {photoUrls.length < 10 && (
                                <button
                                    type="button"
                                    onClick={addPhotoField}
                                    className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 hover:border-violet-400 hover:bg-violet-50/30 transition-all flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-violet-600 group"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-white/50 group-hover:bg-white group-hover:shadow-md flex items-center justify-center transition-all">
                                        <Plus size={24} />
                                    </div>
                                    <span className="text-sm font-bold">Add Photo Slot</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
