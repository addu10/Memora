'use client'

// Login Page
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
        <div className="auth-page" style={{
            background: 'var(--mesh-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-lg)'
        }}>
            <div className="auth-card" style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-xl)',
                width: '100%',
                maxWidth: '440px'
            }}>
                <div className="auth-header" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                    <div className="auth-logo" style={{
                        marginBottom: 'var(--space-md)',
                        animation: 'fadeInUp 0.6s ease',
                        display: 'flex',
                        justifyContent: 'center'
                    }}>
                        <img src="/icons/logo.png" alt="Memora Logo" className="premium-icon logo-icon-lg" />
                    </div>
                    <h1 className="auth-title" style={{
                        fontSize: '2.25rem',
                        fontWeight: 800,
                        letterSpacing: '-0.025em',
                        background: 'var(--purple-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: 'var(--space-xs)'
                    }}>Welcome Back</h1>
                    <p className="auth-subtitle" style={{ color: 'var(--gray-500)', fontWeight: 500 }}>
                        Modern reminiscence therapy for your loved ones.
                    </p>
                </div>

                <div className="demo-box" style={{
                    background: 'var(--primary-50)',
                    border: '1px dashed var(--primary-300)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-md)',
                    marginBottom: 'var(--space-xl)',
                    textAlign: 'center'
                }}>
                    <p className="demo-title" style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.85rem' }}>🔑 DEMO ACCESS</p>
                    <p className="demo-text" style={{ fontSize: '0.875rem', color: 'var(--primary-600)' }}>demo@memora.com · demo123</p>
                </div>

                {error && (
                    <div className="error-message" style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--space-lg)',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        border: '1px solid #fecaca'
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
                        <label className="form-label" style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--space-xs)'
                        }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="you@example.com"
                            required
                            style={{
                                width: '100%',
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--gray-200)',
                                background: 'rgba(255,255,255,0.5)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
                        <label className="form-label" style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--gray-700)',
                            marginBottom: 'var(--space-xs)'
                        }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--gray-200)',
                                background: 'rgba(255,255,255,0.5)',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{
                        width: '100%',
                        padding: 'var(--space-md)',
                        fontSize: '1rem',
                        fontWeight: 700,
                        boxShadow: '0 10px 15px -3px rgba(124, 58, 237, 0.3)'
                    }} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer" style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-xl)',
                    fontSize: '0.875rem',
                    color: 'var(--gray-500)'
                }}>
                    <p>Don&apos;t have an account? <Link href="/register" style={{ color: 'var(--primary-600)', fontWeight: 600 }}>Create one</Link></p>
                </div>
            </div>
        </div>
    )
}
