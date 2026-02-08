'use client'

// Settings Page
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Phone, Mail, Lock, Shield, CheckCircle2, AlertCircle, Save } from 'lucide-react'

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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                        Profile & <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x">Settings</span>
                    </h1>
                    <p className="text-neutral-500 mt-2 text-lg">Manage your caregiver account information and security.</p>
                </div>
            </div>

            <div className="grid gap-8">
                {/* Profile Section */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm-soft border border-neutral-100">
                    <div className="flex items-center gap-6 mb-8 border-b border-neutral-100 pb-8">
                        <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold shrink-0">
                            {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-neutral-900">Public Profile</h3>
                            <p className="text-neutral-500">This information will be visible to family members.</p>
                        </div>
                    </div>

                    {profileSuccess && (
                        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-3 font-medium border border-emerald-100">
                            <CheckCircle2 size={20} />
                            {profileSuccess}
                        </div>
                    )}
                    {profileError && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 font-medium border border-red-100">
                            <AlertCircle size={20} />
                            {profileError}
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                    <User size={16} />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                    <Phone size={16} />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none font-medium"
                                    placeholder="+91..."
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                <Mail size={16} />
                                Email Address (Read-only)
                            </label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 cursor-not-allowed font-medium"
                            />
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={profileLoading}
                            >
                                {profileLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        <span>Update Profile</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Security Section */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm-soft border border-neutral-100">
                    <div className="flex items-center gap-6 mb-8 border-b border-neutral-100 pb-8">
                        <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
                            <Shield size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-neutral-900">Security & Password</h3>
                            <p className="text-neutral-500">Change your password to keep your account secure.</p>
                        </div>
                    </div>

                    {securitySuccess && (
                        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-3 font-medium border border-emerald-100">
                            <CheckCircle2 size={20} />
                            {securitySuccess}
                        </div>
                    )}
                    {securityError && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 font-medium border border-red-100">
                            <AlertCircle size={20} />
                            {securityError}
                        </div>
                    )}

                    <form onSubmit={handlePasswordUpdate} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                    <Lock size={16} />
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none font-medium"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none font-medium"
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-8 py-4 bg-white text-neutral-900 border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
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
