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
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Settings</h1>
                <p style={{ color: 'var(--gray-500)' }}>Manage your account and security preferences.</p>
            </div>

            <div className="space-y-8">
                {/* Profile Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-xl font-semibold mb-6 text-slate-800">Profile Information</h3>

                    {profileSuccess && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 flex items-center gap-2">
                            <span>✅</span> {profileSuccess}
                        </div>
                    )}
                    {profileError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                            <span>⚠️</span> {profileError}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="form-input"
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
                                    placeholder="+91..."
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="form-input bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={profileLoading}
                        >
                            {profileLoading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                </div>

                {/* Security Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-xl font-semibold mb-6 text-slate-800">Security</h3>

                    {securitySuccess && (
                        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100 flex items-center gap-2">
                            <span>✅</span> {securitySuccess}
                        </div>
                    )}
                    {securityError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                            <span>⚠️</span> {securityError}
                        </div>
                    )}

                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="form-input"
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
                                minLength={6}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-secondary"
                            disabled={securityLoading}
                        >
                            {securityLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
