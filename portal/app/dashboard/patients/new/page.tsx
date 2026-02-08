'use client'

// Add New Patient Wizard (Gamified)
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    User,
    Calendar,
    Lock,
    Activity,
    FileText,
    ChevronRight,
    ChevronLeft,
    Check,
    Sparkles,
    Shield,
    Brain
} from 'lucide-react'


export default function NewPatientPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [step, setStep] = useState(1)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        pin: '',
        mmseScore: '',
        diagnosis: '',
        notes: ''
    })

    const totalSteps = 4

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1)
    }

    const prevStep = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const data = {
            name: formData.name,
            age: parseInt(formData.age),
            pin: formData.pin || '0000',
            mmseScore: formData.mmseScore ? parseInt(formData.mmseScore) : null,
            diagnosis: formData.diagnosis || null,
            notes: formData.notes || null
        }

        try {
            const res = await fetch('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                const result = await res.json()
                throw new Error(result.error || 'Failed to create patient')
            }

            router.push('/dashboard/patients')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    // Step Content Components
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-neutral-900">Who are you caring for?</h2>
                            <p className="text-neutral-500">Let's start with the basics.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Patient's Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-4 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-lg"
                                        placeholder="e.g. Grandma Rose"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Age</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Calendar className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
                                    </div>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-4 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-lg"
                                        placeholder="e.g. 78"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-neutral-900">Secure Access</h2>
                            <p className="text-neutral-500">Set a simple PIN for the mobile app.</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 rounded-3xl border border-neutral-100 mb-6">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                <Shield className="w-8 h-8 text-primary-600" />
                            </div>
                            <div className="w-full max-w-xs space-y-4">
                                <label className="block text-sm font-bold text-neutral-700 text-center">4-Digit PIN</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-neutral-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="pin"
                                        value={formData.pin}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                                            setFormData(prev => ({ ...prev, pin: val }))
                                        }}
                                        className="w-full pl-11 pr-4 py-4 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-mono text-2xl tracking-[0.5em] text-center"
                                        placeholder="0000"
                                        maxLength={4}
                                    />
                                </div>
                                <p className="text-xs text-neutral-400 text-center">This helps keep patient data private.</p>
                            </div>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-neutral-900">Medical Context</h2>
                            <p className="text-neutral-500">Optional details to help track progress.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Diagnosis (Optional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Brain className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="diagnosis"
                                        value={formData.diagnosis}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-4 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium"
                                        placeholder="e.g. Early-stage Alzheimer's"
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-neutral-700 mb-2">MMSE Score (Optional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Activity className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
                                    </div>
                                    <input
                                        type="number"
                                        name="mmseScore"
                                        value={formData.mmseScore}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-4 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium"
                                        placeholder="0-30"
                                        max={30}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-neutral-900">Final Touches</h2>
                            <p className="text-neutral-500">Anything else we should know?</p>
                        </div>
                        <div className="group">
                            <label className="block text-sm font-bold text-neutral-700 mb-2">Notes</label>
                            <div className="relative">
                                <div className="absolute top-4 left-4 pointer-events-none">
                                    <FileText className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
                                </div>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-4 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium min-h-[120px]"
                                    placeholder="Add any specific preferences, triggers, or important details..."
                                />
                            </div>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    // Validation for Next Button
    const isStepValid = () => {
        if (step === 1) return formData.name.trim().length > 0 && formData.age.trim().length > 0
        if (step === 2) return formData.pin.length === 4
        return true
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg">

                {/* Header / Progress */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <Link href="/dashboard/patients" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-bold transition-colors">
                            <ChevronLeft size={20} />
                            <span>Back</span>
                        </Link>
                        <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                            Step {step} of {totalSteps}
                        </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-indigo-100/50 border border-neutral-100 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10" />

                    {/* Step Icon */}
                    <div className="absolute top-8 right-8 text-neutral-100 rotate-12">
                        <Sparkles size={80} fill="currentColor" />
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        {renderStepContent()}

                        <div className="flex gap-4 mt-10 pt-4">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex-1 py-4 rounded-xl border-2 border-neutral-100 font-bold text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <ChevronLeft size={20} />
                                    Back
                                </button>
                            )}

                            {step < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!isStepValid()}
                                    className="flex-1 py-4 rounded-xl bg-neutral-900 text-white font-bold shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                                >
                                    Next Step
                                    <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? 'Creating...' : 'Create Profile'}
                                    {!loading && <Check size={20} />}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
