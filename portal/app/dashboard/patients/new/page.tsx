'use client'

// Add New Patient Page
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPatientPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            age: parseInt(formData.get('age') as string),
            pin: formData.get('pin') || '0000',
            mmseScore: formData.get('mmseScore') ? parseInt(formData.get('mmseScore') as string) : null,
            diagnosis: formData.get('diagnosis') || null,
            notes: formData.get('notes') || null
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
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="form-page">
            <div className="page-header">
                <h1 className="page-title">Add New Patient</h1>
            </div>

            <div className="form-card">
                {error && (
                    <div className="error-message">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Patient Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                placeholder="Enter patient's full name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Age *</label>
                            <input
                                type="number"
                                name="age"
                                className="form-input"
                                placeholder="65"
                                min="1"
                                max="120"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Login PIN (4 digits) *</label>
                        <input
                            type="text"
                            name="pin"
                            className="form-input"
                            placeholder="0000"
                            maxLength={4}
                            pattern="\d{4}"
                            required
                        />
                        <small className="text-slate-500 text-xs">Used for logging into the mobile app</small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">MMSE Score (Optional)</label>
                            <input
                                type="number"
                                name="mmseScore"
                                className="form-input"
                                placeholder="20-26 for early-stage"
                                min="0"
                                max="30"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Diagnosis</label>
                            <input
                                type="text"
                                name="diagnosis"
                                className="form-input"
                                placeholder="Early-stage Alzheimer's"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            name="notes"
                            className="form-input"
                            placeholder="Any additional notes about the patient..."
                            rows={3}
                        />
                    </div>

                    <div className="form-actions">
                        <Link href="/dashboard/patients" className="btn btn-secondary">
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Add Patient'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
