'use client'

// Edit Family Member Page
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import ImageUpload from '@/app/dashboard/components/ImageUpload'

const relationshipOptions = [
    'Wife', 'Husband', 'Son', 'Daughter', 'Brother', 'Sister',
    'Father', 'Mother', 'Grandson', 'Granddaughter',
    'Son-in-law', 'Daughter-in-law', 'Nephew', 'Niece',
    'Friend', 'Neighbor', 'Caretaker', 'Other'
]

export default function EditFamilyMemberPage() {
    const router = useRouter()
    const params = useParams()
    const memberId = params.id as string

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')

    // Form State
    const [name, setName] = useState('')
    const [relationship, setRelationship] = useState('')
    const [notes, setNotes] = useState('')
    const [photoUrls, setPhotoUrls] = useState<string[]>([''])

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const res = await fetch(`/api/family/${memberId}`)
                if (!res.ok) throw new Error('Failed to fetch family member')

                const data = await res.json()
                setName(data.name)
                setRelationship(data.relationship)
                setNotes(data.notes || '')

                const photos = data.photoUrls || []
                if (photos.length > 0) {
                    setPhotoUrls(photos)
                }
            } catch (err: any) {
                setError(err.message)
            } finally {
                setFetching(false)
            }
        }

        if (memberId) {
            fetchMember()
        }
    }, [memberId])

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

        const data = {
            name,
            relationship,
            photoUrls: photoUrls.filter(url => url.trim() !== ''),
            notes
        }

        try {
            const res = await fetch(`/api/family/${memberId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                const result = await res.json()
                throw new Error(result.error || 'Failed to update family member')
            }

            router.push('/dashboard/family')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Edit Family Member</h1>
                <p style={{ color: 'var(--gray-500)' }}>Update details and reference photos.</p>
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
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
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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
                                        value={relationship}
                                        onChange={(e) => setRelationship(e.target.value)}
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
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
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
                                {loading ? 'Saving...' : 'Save Changes'}
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
