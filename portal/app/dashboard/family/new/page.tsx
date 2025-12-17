'use client'

// Add New Family Member Page
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import ImageUpload from '../../components/ImageUpload'

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
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Add Family Member</h1>
                <p style={{ color: 'var(--gray-500)' }}>Add reference photos ensuring clear visibility for face recognition.</p>
            </div>

            {error && (
                <div style={{
                    background: '#FEF2F2',
                    color: '#991B1B',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1.5rem',
                    border: '1px solid #FCA5A5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="family-form-grid">
                    {/* Left Column: Details */}
                    <div>
                        <div className="form-section-card">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--gray-800)' }}>Personal Details</h3>

                            <div className="form-group">
                                <label className="form-label">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="e.g., Lakshmi"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Relationship *</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        name="relationship"
                                        className="form-input form-select"
                                        required
                                    >
                                        <option value="">Select relationship...</option>
                                        {relationshipOptions.map(rel => (
                                            <option key={rel} value={rel}>{rel}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    className="form-input"
                                    placeholder="Distinctive features (glasses, etc.)"
                                    rows={4}
                                    style={{ resize: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <Link
                                href="/dashboard/family"
                                className="btn btn-secondary"
                                style={{ flex: 1, padding: '0.875rem' }}
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '0.875rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Member'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Photos Grid */}
                    <div>
                        <div className="form-section-card" style={{ height: '100%' }}>
                            <div className="photo-grid-header">
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-800)' }}>Reference Photos</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>Add 5-10 clear photos from different angles.</p>
                                </div>
                                <span className="photo-count-badge">
                                    {photoUrls.filter(u => u !== '').length} / 10
                                </span>
                            </div>

                            <div className="photo-grid">
                                {photoUrls.map((url, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                        <ImageUpload
                                            bucket="family-photos"
                                            onUpload={(newUrl) => updatePhotoUrl(index, newUrl)}
                                            label={`Photo ${index + 1}`}
                                            compact={true}
                                            currentUrl={url}
                                        />
                                        {/* Remove Button */}
                                        {url && photoUrls.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removePhotoField(index)}
                                                className="remove-photo-btn"
                                                title="Remove photo"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {photoUrls.length < 10 && (
                                    <button
                                        type="button"
                                        onClick={addPhotoField}
                                        className="add-slot-btn"
                                    >
                                        <span style={{ fontSize: '2rem', marginBottom: '0.25rem', fontWeight: 300 }}>+</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Add Slot</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
