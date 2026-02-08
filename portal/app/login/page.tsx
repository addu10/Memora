'use client'

// Login Page
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            let result
            try {
                result = await res.json()
            } catch (error) {
                console.error('Failed to parse error response:', error)
                throw new Error('Server connection failed. Please check your internet connection or try again later.')
            }

            if (!res.ok) {
                throw new Error(result.error || 'Login failed')
            }

            // After login, fetch patients and auto-select the first one
            const patientsRes = await fetch('/api/patients')
            if (patientsRes.ok) {
                const data = await patientsRes.json()
                if (data.patients && data.patients.length > 0) {
                    // Auto-select the first patient
                    await fetch('/api/patient/select', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ patientId: data.patients[0].id })
                    })
                }
            }

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F0F4F8] relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl translate-y-1/2"></div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-8 md:p-12 relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="mb-6 animate-in slide-in-from-bottom-4 duration-700 delay-100 flex justify-center">
                        <img src="/images/logo-full.jpg" alt="Memora" className="h-20 w-auto object-contain mix-blend-multiply" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 mb-2">Welcome Back</h1>
                    <p className="text-neutral-500 font-medium">Modern reminiscence therapy for your loved ones.</p>
                </div>



                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-700 ml-1">Email Address</label>
                        <div className="relative">
                            <input
                                type="email"
                                name="email"
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium bg-white/50"
                                placeholder="you@example.com"
                                required
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                                <Mail size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-neutral-700 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-medium bg-white/50"
                                placeholder="••••••••"
                                required
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                                <Lock size={18} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0 text-lg"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                        {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm font-medium text-neutral-500">
                    Don't have an account? <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">Create one</Link>
                </div>
            </div>
        </div>
    )
}
