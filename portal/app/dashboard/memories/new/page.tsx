'use client'

// Add New Memory Page with Per-Photo Labeling for AI Therapy
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

const settingOptions = [
    'Indoor', 'Outdoor', 'Garden', 'Living Room', 'Kitchen',
    'Temple', 'Beach', 'Mountain', 'Restaurant', 'Other'
]

const activityOptions = [
    'Celebrating', 'Cooking', 'Eating', 'Praying', 'Playing',
    'Dancing', 'Singing', 'Talking', 'Posing', 'Working', 'Other'
]

const moodOptions = ['Happy', 'Excited', 'Peaceful', 'Neutral', 'Serious']

interface FamilyMember {
    id: string
    name: string
    relationship: string
}

interface PhotoLabel {
    photoUrl: string
    people: string[]
    description: string
    setting: string
    activities: string
    facialExpressions: string
}

export default function NewMemoryPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [photoUrls, setPhotoUrls] = useState<string[]>([''])
    const [photoLabels, setPhotoLabels] = useState<PhotoLabel[]>([])
    const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null)

    // Family Member Selection State
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
    const [selectedPeople, setSelectedPeople] = useState<string[]>([])
    const [customPerson, setCustomPerson] = useState('')

    useEffect(() => {
        const fetchFamily = async () => {
            try {
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

        if (value && !photoLabels.find(l => l.photoUrl === value)) {
            setPhotoLabels([...photoLabels, {
                photoUrl: value,
                people: [],
                description: '',
                setting: '',
                activities: '',
                facialExpressions: ''
            }])
        }
    }

    const removePhotoField = (index: number) => {
        const urlToRemove = photoUrls[index]
        setPhotoUrls(photoUrls.filter((_, i) => i !== index))
        setPhotoLabels(photoLabels.filter(l => l.photoUrl !== urlToRemove))
        if (activePhotoIndex === index) setActivePhotoIndex(null)
    }

    const updatePhotoLabel = (photoUrl: string, field: keyof PhotoLabel, value: any) => {
        setPhotoLabels(labels => {
            const existing = labels.find(l => l.photoUrl === photoUrl)
            if (existing) {
                return labels.map(l =>
                    l.photoUrl === photoUrl ? { ...l, [field]: value } : l
                )
            }
            return [...labels, {
                photoUrl,
                people: [],
                description: '',
                setting: '',
                activities: '',
                facialExpressions: '',
                [field]: value
            }]
        })
    }

    const togglePhotoPerson = (photoUrl: string, personName: string) => {
        const label = photoLabels.find(l => l.photoUrl === photoUrl)
        const currentPeople = label?.people || []
        const newPeople = currentPeople.includes(personName)
            ? currentPeople.filter(p => p !== personName)
            : [...currentPeople, personName]
        updatePhotoLabel(photoUrl, 'people', newPeople)
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
            setError('Please tag at least one person.')
            setLoading(false)
            return
        }

        const validPhotoLabels = photoLabels.filter(l => validPhotos.includes(l.photoUrl))

        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            photoUrls: validPhotos,
            photoLabels: validPhotoLabels,
            date: formData.get('date'),
            event: formData.get('event'),
            location: formData.get('location'),
            people: selectedPeople.join(', '),
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

    const getPhotoLabel = (url: string) => photoLabels.find(l => l.photoUrl === url)
    const activePhoto = activePhotoIndex !== null ? photoUrls[activePhotoIndex] : null

    return (
        <div className="memory-form-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Add New Memory</h1>
                    <p className="page-subtitle">
                        Create a memory with photos and labels for AI-powered therapy sessions.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>
                )}

                {/* SECTION 1: Memory Details - Full Width */}
                <div className="memory-details-section">
                    <h2 className="section-heading">📝 Memory Details</h2>

                    <div className="memory-details-grid">
                        <div className="form-group">
                            <label className="form-label">Memory Title *</label>
                            <input
                                type="text"
                                name="title"
                                className="form-input"
                                placeholder="e.g., Onam 1998 at Grandma's House"
                                required
                            />
                        </div>

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
                            <label className="form-label">Event Type *</label>
                            <select name="event" className="form-input form-select" required>
                                <option value="">Select event...</option>
                                {eventCategories.map(event => (
                                    <option key={event} value={event}>{event}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location *</label>
                            <select name="location" className="form-input form-select" required>
                                <option value="">Select location...</option>
                                {locationOptions.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Importance</label>
                            <select name="importance" className="form-input form-select">
                                <option value="3">⭐⭐⭐ Medium</option>
                                <option value="5">⭐⭐⭐⭐⭐ High</option>
                                <option value="1">⭐ Low</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Description (Optional)</label>
                            <textarea
                                name="description"
                                className="form-input"
                                rows={2}
                                placeholder="What happened during this memory?"
                            />
                        </div>
                    </div>

                    {/* People Selection */}
                    <div className="people-section">
                        <label className="form-label">People in Memory *</label>

                        <div className="selected-people-tags">
                            {selectedPeople.map(person => (
                                <span key={person} className="person-tag selected">
                                    {person}
                                    <button type="button" onClick={() => togglePerson(person)} className="remove-tag">×</button>
                                </span>
                            ))}
                            {selectedPeople.length === 0 && (
                                <span className="helper-text">Select people below or type custom names</span>
                            )}
                        </div>

                        {familyMembers.length > 0 && (
                            <div className="family-picker">
                                <span className="picker-label">Family Members:</span>
                                {familyMembers.map(member => (
                                    <button
                                        key={member.id}
                                        type="button"
                                        onClick={() => togglePerson(member.name)}
                                        className={`person-tag ${selectedPeople.includes(member.name) ? 'selected' : ''}`}
                                    >
                                        {member.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        <input
                            type="text"
                            value={customPerson}
                            onChange={(e) => setCustomPerson(e.target.value)}
                            onKeyDown={addCustomPerson}
                            className="form-input"
                            placeholder="Type other names and press Enter..."
                            style={{ marginTop: '0.5rem' }}
                        />
                    </div>
                </div>

                {/* SECTION 2: Photos + Labeling - Side by Side */}
                <div className="photos-labeling-section">
                    {/* Left: Photo Grid */}
                    <div className="photos-panel">
                        <div className="panel-header">
                            <h2 className="section-heading">📷 Photos</h2>
                            <span className="photo-count">{photoUrls.filter(u => u).length}/10</span>
                        </div>
                        <p className="helper-text">Upload photos and click each one to add AI labels</p>

                        <div className="photo-upload-grid">
                            {photoUrls.map((url, index) => (
                                <div
                                    key={index}
                                    className={`photo-upload-item ${activePhotoIndex === index ? 'active' : ''}`}
                                    onClick={() => url && setActivePhotoIndex(index)}
                                >
                                    <ImageUpload
                                        bucket="memories"
                                        onUpload={(newUrl) => {
                                            updatePhotoUrl(index, newUrl)
                                            setActivePhotoIndex(index)
                                        }}
                                        label={`Photo ${index + 1}`}
                                        compact={true}
                                        currentUrl={url}
                                    />
                                    {url && (
                                        <>
                                            {getPhotoLabel(url)?.description && (
                                                <div className="labeled-badge">✓</div>
                                            )}
                                            {photoUrls.filter(u => u).length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        removePhotoField(index)
                                                    }}
                                                    className="remove-photo-btn"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                            {photoUrls.length < 10 && (
                                <button type="button" onClick={addPhotoField} className="add-photo-btn">
                                    <span className="add-icon">+</span>
                                    <span>Add Photo</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Labeling Panel */}
                    <div className={`labeling-panel ${activePhoto ? 'active' : ''}`}>
                        {activePhoto ? (
                            <>
                                <div className="panel-header">
                                    <h2 className="section-heading">🏷️ Label Photo {(activePhotoIndex ?? 0) + 1}</h2>
                                    <button
                                        type="button"
                                        onClick={() => setActivePhotoIndex(null)}
                                        className="close-panel-btn"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="label-preview">
                                    <img src={activePhoto} alt="Selected photo" />
                                </div>

                                <p className="helper-text">Labels help AI generate better therapy questions</p>

                                {/* People in THIS photo */}
                                <div className="label-field">
                                    <label className="label-title">Who's in this photo?</label>
                                    <div className="person-chips">
                                        {selectedPeople.length > 0 ? (
                                            selectedPeople.map(person => {
                                                const isInPhoto = getPhotoLabel(activePhoto)?.people?.includes(person)
                                                return (
                                                    <button
                                                        key={person}
                                                        type="button"
                                                        onClick={() => togglePhotoPerson(activePhoto, person)}
                                                        className={`chip ${isInPhoto ? 'active' : ''}`}
                                                    >
                                                        {person}
                                                    </button>
                                                )
                                            })
                                        ) : (
                                            <span className="helper-text">Add people in memory details first</span>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="label-field">
                                    <label className="label-title">What's happening?</label>
                                    <textarea
                                        value={getPhotoLabel(activePhoto)?.description || ''}
                                        onChange={(e) => updatePhotoLabel(activePhoto, 'description', e.target.value)}
                                        className="label-textarea"
                                        rows={2}
                                        placeholder="e.g., Family eating Onam sadhya together"
                                    />
                                </div>

                                {/* Setting */}
                                <div className="label-field">
                                    <label className="label-title">Setting</label>
                                    <select
                                        value={getPhotoLabel(activePhoto)?.setting || ''}
                                        onChange={(e) => updatePhotoLabel(activePhoto, 'setting', e.target.value)}
                                        className="label-select"
                                    >
                                        <option value="">Select setting...</option>
                                        {settingOptions.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Activities */}
                                <div className="label-field">
                                    <label className="label-title">Activity</label>
                                    <select
                                        value={getPhotoLabel(activePhoto)?.activities || ''}
                                        onChange={(e) => updatePhotoLabel(activePhoto, 'activities', e.target.value)}
                                        className="label-select"
                                    >
                                        <option value="">Select activity...</option>
                                        {activityOptions.map(a => (
                                            <option key={a} value={a}>{a}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Mood */}
                                <div className="label-field">
                                    <label className="label-title">Mood / Expression</label>
                                    <div className="mood-chips">
                                        {moodOptions.map(mood => {
                                            const isSelected = getPhotoLabel(activePhoto)?.facialExpressions === mood.toLowerCase()
                                            return (
                                                <button
                                                    key={mood}
                                                    type="button"
                                                    onClick={() => updatePhotoLabel(activePhoto, 'facialExpressions', mood.toLowerCase())}
                                                    className={`mood-chip ${isSelected ? 'active' : ''}`}
                                                >
                                                    {mood}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="empty-labeling">
                                <div className="empty-icon">🏷️</div>
                                <p>Click on a photo to add labels</p>
                                <span className="helper-text">Labels help generate better therapy questions</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="form-actions">
                    <Link href="/dashboard/memories" className="btn btn-secondary">
                        Cancel
                    </Link>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? 'Creating Memory...' : '✨ Create Memory'}
                    </button>
                </div>
            </form>
        </div>
    )
}
