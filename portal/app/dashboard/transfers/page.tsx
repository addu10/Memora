'use client'

// Transfer Center — Manage incoming and outgoing patient transfers
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ModernSelect from '@/app/dashboard/components/ModernSelect'
import {
    ArrowLeftRight,
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    XCircle,
    Ban,
    Mail,
    MessageSquare,
    AlertCircle,
    AlertTriangle,
    Send,
    Eye,
    Loader2,
    X,
    Users as UsersIcon
} from 'lucide-react'

interface Transfer {
    id: string
    patientId: string
    patientName: string
    patientPhoto: string | null
    otherCaregiverName: string
    otherCaregiverEmail: string
    status: string
    message: string | null
    expiresAt: string
    respondedAt: string | null
    createdAt: string
    direction: 'incoming' | 'outgoing'
}

interface Patient {
    id: string
    name: string
    photoUrl: string | null
}

function getStatusStyle(status: string) {
    switch (status) {
        case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: <Clock size={14} />, label: 'Pending' }
        case 'accepted': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle2 size={14} />, label: 'Accepted' }
        case 'rejected': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: <XCircle size={14} />, label: 'Rejected' }
        case 'cancelled': return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: <Ban size={14} />, label: 'Cancelled' }
        case 'expired': return { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200', icon: <Clock size={14} />, label: 'Expired' }
        default: return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: null, label: status }
    }
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
    })
}

function getTimeRemaining(expiresAt: string) {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m remaining`
}

export default function TransferCenterPage() {
    const router = useRouter()
    const [incoming, setIncoming] = useState<Transfer[]>([])
    const [outgoing, setOutgoing] = useState<Transfer[]>([])
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [mounted, setMounted] = useState(false)

    // Initiation Modal
    const [showModal, setShowModal] = useState(false)
    const [selectedPatientId, setSelectedPatientId] = useState('')
    const [recipientEmail, setRecipientEmail] = useState('')
    const [transferMessage, setTransferMessage] = useState('')
    const [initiating, setInitiating] = useState(false)
    const [confirmName, setConfirmName] = useState('')
    const [modalError, setModalError] = useState('')

    useEffect(() => {
        setMounted(true)
        fetchTransfers()
        fetchPatients()
    }, [])

    async function fetchTransfers() {
        try {
            const res = await fetch('/api/transfers')
            if (!res.ok) throw new Error('Failed to load transfers')
            const data = await res.json()
            setIncoming(data.incoming || [])
            setOutgoing(data.outgoing || [])
        } catch {
            setError('Failed to load transfers')
        } finally {
            setLoading(false)
        }
    }

    async function fetchPatients() {
        try {
            const res = await fetch('/api/patients')
            if (res.ok) {
                const data = await res.json()
                setPatients(data.patients || [])
            }
        } catch { /* silent fail */ }
    }

    async function handleAccept(transferId: string) {
        setActionLoading(transferId)
        setError('')
        try {
            const res = await fetch(`/api/transfers/${transferId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'accept' })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to accept')

            // Auto-select the newly received patient
            if (data.patientId) {
                await fetch('/api/patient/select', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ patientId: data.patientId })
                })
            }

            setSuccess('Patient transferred successfully! Redirecting to briefing...')
            // Redirect to briefing slideshow
            setTimeout(() => {
                router.push(`/dashboard/transfers/${transferId}/briefing`)
                router.refresh()
            }, 1500)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    async function handleReject(transferId: string) {
        setActionLoading(transferId)
        setError('')
        try {
            const res = await fetch(`/api/transfers/${transferId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject' })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to reject')
            setSuccess('Transfer rejected')
            fetchTransfers()
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    async function handleCancel(transferId: string) {
        setActionLoading(transferId)
        setError('')
        try {
            const res = await fetch(`/api/transfers/${transferId}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to cancel')
            setSuccess('Transfer cancelled')
            fetchTransfers()
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setActionLoading(null)
        }
    }

    const selectedPatientName = patients.find(p => p.id === selectedPatientId)?.name || ''
    const nameConfirmed = confirmName === selectedPatientName && selectedPatientName !== ''

    async function handleInitiateTransfer() {
        if (!nameConfirmed) return
        setInitiating(true)
        setModalError('')
        try {
            const res = await fetch('/api/transfers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: selectedPatientId,
                    recipientEmail: recipientEmail.trim(),
                    message: transferMessage.trim() || null,
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to create transfer')
            setSuccess(`Transfer request sent to ${recipientEmail}!`)
            setShowModal(false)
            setRecipientEmail('')
            setTransferMessage('')
            setSelectedPatientId('')
            setConfirmName('')
            fetchTransfers()
        } catch (err: any) {
            setModalError(err.message)
        } finally {
            setInitiating(false)
        }
    }

    const pendingIncoming = incoming.filter(t => t.status === 'pending')

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
                        <ArrowLeftRight className="text-indigo-500" size={28} />
                        Transfer Center
                    </h1>
                    <p className="text-neutral-500 font-medium mt-1">
                        Manage patient transfers between caregivers
                    </p>
                </div>

                <button
                    onClick={() => { setShowModal(true); setModalError('') }}
                    className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 flex items-center gap-2"
                >
                    <Send size={18} />
                    Transfer a Patient
                </button>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
            )}
            {success && (
                <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-start gap-3 text-sm font-medium border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    <span>{success}</span>
                    <button onClick={() => setSuccess('')} className="ml-auto text-emerald-400 hover:text-emerald-600"><X size={16} /></button>
                </div>
            )}

            {/* Incoming Transfers Section */}
            <section>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 mb-4">
                    <ArrowDownLeft size={20} className="text-emerald-500" />
                    Incoming Transfers
                    {pendingIncoming.length > 0 && (
                        <span className="ml-2 px-2.5 py-0.5 text-xs font-bold bg-red-100 text-red-600 rounded-full animate-pulse">
                            {pendingIncoming.length} pending
                        </span>
                    )}
                </h2>

                {incoming.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-neutral-100 text-center text-neutral-400">
                        No incoming transfers
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {incoming.map(transfer => {
                            const status = getStatusStyle(transfer.status)
                            return (
                                <div key={transfer.id} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Patient Avatar */}
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20 shrink-0">
                                            {transfer.patientName[0]}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-neutral-900 text-lg">{transfer.patientName}</h3>
                                            <p className="text-sm text-neutral-500">
                                                From <span className="font-bold text-neutral-700">{transfer.otherCaregiverName}</span>
                                                <span className="text-neutral-300 mx-1">•</span>
                                                {transfer.otherCaregiverEmail}
                                            </p>
                                            {transfer.message && (
                                                <p className="text-sm text-neutral-600 mt-1 flex items-start gap-1.5">
                                                    <MessageSquare size={14} className="shrink-0 mt-0.5 text-indigo-400" />
                                                    <span className="italic">"{transfer.message}"</span>
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                                                <span>{formatDate(transfer.createdAt)}</span>
                                                {transfer.status === 'pending' && (
                                                    <span className="text-amber-500 font-bold">{getTimeRemaining(transfer.expiresAt)}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status + Actions */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.text} border ${status.border}`}>
                                                {status.icon} {status.label}
                                            </span>

                                            {transfer.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/dashboard/transfers/${transfer.id}/briefing`}
                                                        className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors font-bold text-sm flex items-center gap-1.5"
                                                    >
                                                        <Eye size={14} /> Preview
                                                    </Link>
                                                    <button
                                                        onClick={() => handleAccept(transfer.id)}
                                                        disabled={actionLoading === transfer.id}
                                                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-bold text-sm disabled:opacity-50"
                                                    >
                                                        {actionLoading === transfer.id ? <Loader2 size={14} className="animate-spin" /> : 'Accept'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(transfer.id)}
                                                        disabled={actionLoading === transfer.id}
                                                        className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-bold text-sm disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Outgoing Transfers Section */}
            <section>
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2 mb-4">
                    <ArrowUpRight size={20} className="text-indigo-500" />
                    Outgoing Transfers
                </h2>

                {outgoing.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-neutral-100 text-center text-neutral-400">
                        No outgoing transfers
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {outgoing.map(transfer => {
                            const status = getStatusStyle(transfer.status)
                            return (
                                <div key={transfer.id} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-500/20 shrink-0">
                                            {transfer.patientName[0]}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-neutral-900 text-lg">{transfer.patientName}</h3>
                                            <p className="text-sm text-neutral-500">
                                                To <span className="font-bold text-neutral-700">{transfer.otherCaregiverName}</span>
                                                <span className="text-neutral-300 mx-1">•</span>
                                                {transfer.otherCaregiverEmail}
                                            </p>
                                            {transfer.message && (
                                                <p className="text-sm text-neutral-600 mt-1 flex items-start gap-1.5">
                                                    <MessageSquare size={14} className="shrink-0 mt-0.5 text-indigo-400" />
                                                    <span className="italic">"{transfer.message}"</span>
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                                                <span>{formatDate(transfer.createdAt)}</span>
                                                {transfer.status === 'pending' && (
                                                    <span className="text-amber-500 font-bold">{getTimeRemaining(transfer.expiresAt)}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.text} border ${status.border}`}>
                                                {status.icon} {status.label}
                                            </span>

                                            {transfer.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancel(transfer.id)}
                                                    disabled={actionLoading === transfer.id}
                                                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-bold text-sm disabled:opacity-50"
                                                >
                                                    {actionLoading === transfer.id ? <Loader2 size={14} className="animate-spin" /> : 'Cancel'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Initiate Transfer Modal — rendered via portal to document.body */}
            {mounted && showModal && createPortal(
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-white/50 animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Fixed Header */}
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between shrink-0">
                            <h3 className="text-xl font-bold text-neutral-900">Transfer a Patient</h3>
                            <button onClick={() => { setShowModal(false); setConfirmName(''); setSelectedPatientId(''); setRecipientEmail(''); setTransferMessage(''); setModalError('') }} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:rotate-90 transition-all">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-6 space-y-5 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d4 transparent' }}>
                            {/* Modal-level error message */}
                            {modalError && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-start gap-2 text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <span>{modalError}</span>
                                    <button onClick={() => setModalError('')} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
                                </div>
                            )}
                            {/* Patient Selection — ModernSelect */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Select Patient</label>
                                <ModernSelect
                                    value={selectedPatientId}
                                    onSelectAction={(val) => {
                                        setSelectedPatientId(val)
                                        setConfirmName('')
                                    }}
                                    options={patients.map(p => ({ value: p.id, label: p.name }))}
                                    placeholder="Choose a patient..."
                                    icon={<UsersIcon size={16} className="text-neutral-400" />}
                                />
                            </div>

                            {/* Recipient Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Recipient Caregiver Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={recipientEmail}
                                        onChange={e => setRecipientEmail(e.target.value)}
                                        placeholder="caregiver@example.com"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium bg-neutral-50"
                                    />
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                </div>
                                <p className="text-xs text-neutral-400">The recipient must have a registered Memora account</p>
                            </div>

                            {/* Optional Message */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Message <span className="text-neutral-400 font-normal">(optional)</span></label>
                                <textarea
                                    value={transferMessage}
                                    onChange={e => setTransferMessage(e.target.value)}
                                    placeholder="Add a note for the receiving caregiver..."
                                    rows={3}
                                    maxLength={500}
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium bg-neutral-50 resize-none"
                                />
                            </div>

                            {/* Warning */}
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 text-xs font-medium flex items-start gap-2">
                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                <span>Once accepted, <strong>{selectedPatientName || 'the patient'}</strong> and all their data will be permanently transferred to the new caregiver. The transfer expires after 72 hours if not accepted.</span>
                            </div>

                            {/* Name Confirmation — Security Check */}
                            {selectedPatientId && recipientEmail && (
                                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Security Verification</label>
                                    <p className="text-neutral-600 text-sm">Type <strong>{selectedPatientName}</strong> to authorize this transfer:</p>
                                    <input
                                        type="text"
                                        value={confirmName}
                                        onChange={(e) => setConfirmName(e.target.value)}
                                        placeholder="Patient name"
                                        className={`w-full p-4 rounded-2xl border-2 transition-all text-xl font-bold text-center text-neutral-900 focus:outline-none placeholder:text-neutral-300 ${nameConfirmed
                                            ? 'border-indigo-500 bg-indigo-50/50 shadow-inner'
                                            : 'border-neutral-200 bg-neutral-50 focus:border-indigo-400 focus:bg-white'
                                            }`}
                                        autoComplete="off"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-6 border-t border-neutral-100 shrink-0">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setConfirmName(''); setModalError('') }}
                                    className="flex-1 py-3 rounded-xl font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleInitiateTransfer}
                                    disabled={initiating || !nameConfirmed || !recipientEmail}
                                    className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {initiating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    {initiating ? 'Sending...' : 'Confirm Transfer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
