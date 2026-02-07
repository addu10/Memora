'use client'

// Settings Page
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
    const router = useRouter()

    // Profile State
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileSuccess, setProfileSuccess] = useState('')
    const [profileError, setProfileError] = useState('')

    // Password State
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [securityLoading, setSecurityLoading] = useState(false)
    const [securitySuccess, setSecuritySuccess] = useState('')
    const [securityError, setSecurityError] = useState('')

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/caregiver')
                if (res.ok) {
                    const data = await res.json()
                    setName(data.name)
                    setEmail(data.email)
                    setPhone(data.phone || '')
                }
            } catch (err) {
                console.error('Failed to load profile')
            }
        }
        fetchProfile()
    }, [])

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setProfileLoading(true)
        setProfileError('')
        setProfileSuccess('')

        try {
            const res = await fetch('/api/caregiver', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone })
            })

            if (!res.ok) throw new Error('Failed to update profile')

            setProfileSuccess('Profile updated successfully!')
            router.refresh()
        } catch (err) {
            setProfileError('Failed to update profile. Please try again.')
        } finally {
            setProfileLoading(false)
        }
    }

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSecurityLoading(true)
        setSecurityError('')
        setSecuritySuccess('')

        try {
            const res = await fetch('/api/caregiver/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to update password')

            setSecuritySuccess('Password updated successfully!')
            setCurrentPassword('')
            setNewPassword('')
        } catch (err: any) {
            setSecurityError(err.message)
        } finally {
            setSecurityLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'var(--space-xl)' }}>
            <div className="page-header" style={{ marginBottom: 'var(--space-2xl)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Profile & Settings</h1>
                    <p className="page-subtitle" style={{ fontSize: '1.1rem', color: 'var(--gray-600)' }}>Manage your caregiver account information and security.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
                {/* Profile Section */}
                <div className="stat-card" style={{ padding: 'var(--space-xl)', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                        <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}>
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Public Profile</h3>
                            <p style={{ color: 'var(--gray-500)', margin: 0 }}>This information will be visible to family members.</p>
                        </div>
                    </div>

                    {profileSuccess && (
                        <div className="success-alert" style={{
                            padding: 'var(--space-md)',
                            background: 'var(--success)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            fontWeight: 600
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg> {profileSuccess}
                        </div>
                    )}
                    {profileError && (
                        <div className="error-alert" style={{
                            padding: 'var(--space-md)',
                            background: 'var(--error)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            fontWeight: 600
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg> {profileError}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gap: 'var(--space-xl)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="form-input"
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="form-input"
                                    style={{ width: '100%' }}
                                    placeholder="+91..."
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address (Read-only)</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="form-input"
                                style={{ width: '100%', background: 'var(--gray-50)', color: 'var(--gray-500)', cursor: 'not-allowed' }}
                            />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ padding: 'var(--space-md) var(--space-2xl)', fontWeight: 600 }}
                                disabled={profileLoading}
                            >
                                {profileLoading ? 'Saving...' : 'Update Profile'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Section */}
                <div className="stat-card" style={{ padding: 'var(--space-xl)', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                        <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '1.5rem', background: 'var(--gray-100)', color: 'var(--gray-700)' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Security & Password</h3>
                            <p style={{ color: 'var(--gray-500)', margin: 0 }}>Change your password to keep your account secure.</p>
                        </div>
                    </div>

                    {securitySuccess && (
                        <div className="success-alert" style={{
                            padding: 'var(--space-md)',
                            background: 'var(--success)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            fontWeight: 600
                        }}>
                            <span>✓</span> {securitySuccess}
                        </div>
                    )}
                    {securityError && (
                        <div className="error-alert" style={{
                            padding: 'var(--space-md)',
                            background: 'var(--error)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-lg)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            fontWeight: 600
                        }}>
                            <span>⚠</span> {securityError}
                        </div>
                    )}

                    <form onSubmit={handlePasswordUpdate} style={{ display: 'grid', gap: 'var(--space-xl)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="form-input"
                                    style={{ width: '100%' }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="form-input"
                                    style={{ width: '100%' }}
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <button
                                type="submit"
                                className="btn btn-secondary"
                                style={{ padding: 'var(--space-md) var(--space-2xl)', fontWeight: 600 }}
                                disabled={securityLoading}
                            >
                                {securityLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
