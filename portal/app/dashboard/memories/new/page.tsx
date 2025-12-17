'use client'

// Add New Memory Page (Multi-Photo + Family Tagging)
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import ImageUpload from '@/app/dashboard/components/ImageUpload'

const eventCategories = [
    'Onam', 'Vishu', 'Wedding', 'Birthday', 'Festival',
    'Family Gathering', 'Travel', 'Temple Visit', 'Childhood', 'Other'
]

const locationOptions = [
    'Home', 'Temple', 'Beach', 'School', 'Hospital',
    'Market', 'Relative\'s House', 'Travel', 'Other'
]

interface FamilyMember {
    id: string
    name: string
    relationship: string
}

export default function NewMemoryPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [photoUrls, setPhotoUrls] = useState<string[]>([''])

    // Family Member Selection State
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
    const [selectedPeople, setSelectedPeople] = useState<string[]>([])
    const [customPerson, setCustomPerson] = useState('')

    useEffect(() => {
        // Fetch family members for tagging
        const fetchFamily = async () => {
            try {
                // Assuming we have an endpoint to list family members for the current patient context
                // Reuse the existing family API or dashboard logic? 
                // Let's assume /api/family lists members for current user's active patient
                // We might need to ensure cookie is set, or better, make a dedicated selector route?
                // For now, let's try fetching from the page wrapper logic or similar.
                // Actually, let's just create a quick client-side fetch helper if /api/family returns lists.
                // The current family page uses server component fetching.
                // We need an API endpoint for this. simpler: just allow typing for now if API missing, 
                // but plan said we MUST link. Let's try fetching from a new endpoint or reusing.
                // Wait, /api/family/[id] exists. /api/family list? 
                // Let's create a quick list endpoint if checking `app/api/caregiver` etc.
                // Actually, let's rely on manual entry if fetch fails, but try to support selection.

                // Let's use a known trick: load from client? No, let's fetch.
                // If /api/family doesn't support listing all, we should add it.
                // PROPOSAL: I'll stick to free-text for "Other" but show checkboxes for known members if I can get them.
                // If I can't easily get them without a new API, I'll update the plan to create /api/family first?
                // No, let's look at `app/dashboard/family/page.tsx`, it uses `prisma` directly.
                // We are client side here. We need an API.
                // I will fetch from `/api/patients/active/family`? No, simpler.
                // I will add a `GET /api/family` that lists all for current patient.
                const res = await fetch('/api/family')
                if (res.ok) {
                    const data = await res.json()
                    setFamilyMembers(data)
                }
            } catch (e) {
                console.error("Could not load family members", e)
            }
        }
        fetchFamily()
    }, [])

    const togglePerson = (name: string) => {
        if (selectedPeople.includes(name)) {
            setSelectedPeople(selectedPeople.filter(p => p !== name))
        } else {
            setSelectedPeople([...selectedPeople, name])
        }
    }

    const addCustomPerson = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && customPerson.trim()) {
            e.preventDefault()
            const name = customPerson.trim()
            if (!selectedPeople.includes(name)) {
                setSelectedPeople([...selectedPeople, name])
            }
            setCustomPerson('')
        }
    }

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
        const validPhotos = photoUrls.filter(url => url.trim() !== '')

        if (validPhotos.length === 0) {
            setError('Please upload at least one photo.')
            setLoading(false)
            return
        }

        if (selectedPeople.length === 0) {
            setError('Please tag at least one person (or add them securely).')
            setLoading(false)
            return
        }

        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            photoUrls: validPhotos,
            date: formData.get('date'),
            event: formData.get('event'),
            location: formData.get('location'),
            people: selectedPeople.join(', '), // Store as string for compatibility, searchable
            importance: parseInt(formData.get('importance') as string) || 3,
            patientId: Cookies.get('selectedPatientId')
        }

        try {
            const res = await fetch('/api/memories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!res.ok) {
                const result = await res.json()
                throw new Error(result.error || 'Failed to create memory')
            }

            router.push('/dashboard/memories')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="form-page" style={{ maxWidth: '1200px' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Add New Memory</h1>
                    <p className="page-subtitle">Add photos and tag family members for automatic recognition.</p>
                </div>
            </div>

            <div className="family-form-grid" style={{ gridTemplateColumns: 'minmax(400px, 1fr) 400px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
                    {/* Left details */}
                    <div className="form-card">
                        {error && (
                            <div className="error-message mb-4">{error}</div>
                        )}

                        <div className="form-group">
                            <label className="form-label">Memory Title *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                placeholder="e.g., Onam 1998"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Event *</label>
                                <select name="event" className="form-input form-select" required>
                                    <option value="">Select...</option>
                                    {eventCategories.map(event => (
                                        <option key={event} value={event}>{event}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Location *</label>
                                <select name="location" className="form-input form-select" required>
                                    <option value="">Select...</option>
                                    {locationOptions.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Importance</label>
                                <select name="importance" className="form-input form-select">
                                    <option value="3">Medium</option>
                                    <option value="5">High</option>
                                    <option value="1">Low</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">People in Photo *</label>

                            {/* Selected Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedPeople.map(person => (
                                    <span key={person} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1">
                                        {person}
                                        <button
                                            type="button"
                                            onClick={() => togglePerson(person)}
                                            className="hover:text-blue-600 font-bold px-1"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Family Selector */}
                            {familyMembers.length > 0 && (
                                <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-2 uppercase font-semibold">Select Family Members:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {familyMembers.map(member => (
                                            <button
                                                key={member.id}
                                                type="button"
                                                onClick={() => togglePerson(member.name)}
                                                className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedPeople.includes(member.name)
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                                    }`}
                                            >
                                                {member.name} ({member.relationship})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Add */}
                            <input
                                type="text"
                                value={customPerson}
                                onChange={(e) => setCustomPerson(e.target.value)}
                                onKeyDown={addCustomPerson}
                                className="form-input"
                                placeholder="Type other names and press Enter..."
                            />
                            <input type="hidden" name="people" value={selectedPeople.join(', ')} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-input"
                                rows={4}
                                placeholder="What happened?"
                            />
                        </div>

                        <div className="form-actions mt-6">
                            <Link href="/dashboard/memories" className="btn btn-secondary">
                                Cancel
                            </Link>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Saving...' : 'Create Memory'}
                            </button>
                        </div>
                    </div>

                    {/* Right Photos */}
                    <div className="form-section-card" style={{ height: 'fit-content' }}>
                        <div className="photo-grid-header">
                            <h3 className="text-lg font-semibold">Photos</h3>
                            <span className="photo-count-badge">
                                {photoUrls.filter(u => u !== '').length} / 10
                            </span>
                        </div>

                        <div className="photo-grid">
                            {photoUrls.map((url, index) => (
                                <div key={index} className="relative">
                                    <ImageUpload
                                        bucket="memories"
                                        onUpload={(newUrl) => updatePhotoUrl(index, newUrl)}
                                        label={`Photo ${index + 1}`}
                                        compact={true}
                                        currentUrl={url}
                                    />
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
                                    <span style={{ fontSize: '2rem' }}>+</span>
                                    <span>Add</span>
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
