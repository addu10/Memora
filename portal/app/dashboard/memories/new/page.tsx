'use client'

// Add New Memory Wizard (Gamified)
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import ImageUpload from '@/app/dashboard/components/ImageUpload'
import {
    ArrowLeft,
    Upload,
    X,
    Plus,
    Tag,
    MapPin,
    User,
    Camera,
    Smile,
    Activity,
    Image as ImageIcon,
    ChevronRight,
    ChevronLeft,
    Check,
    Sparkles,
    Heart,
    AlignLeft
} from 'lucide-react'
import ModernDatePicker from '../../components/ModernDatePicker'
import ModernSelect from '../../components/ModernSelect'
import { handleEnterKeyNavigation } from '@/lib/utils'
import PremiumAlert from '../../components/PremiumAlert'


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
    const [step, setStep] = useState(1)
    const totalSteps = 4

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        event: '',
        location: '',
        description: '',
        importance: '3'
    })

    const [photoUrls, setPhotoUrls] = useState<string[]>([''])
    const [photoLabels, setPhotoLabels] = useState<PhotoLabel[]>([])
    const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '' })

    // Family Member Selection State
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
    const [selectedPeople, setSelectedPeople] = useState<string[]>([])
    const [customPerson, setCustomPerson] = useState('')

    useEffect(() => {
        // Check for patient first
        const patientId = Cookies.get('selectedPatientId')
        if (!patientId) {
            setError('No patient selected. Redirecting to dashboard...')
            setTimeout(() => router.push('/dashboard'), 2000)
            return
        }

        const fetchFamily = async () => {
            try {
                const res = await fetch(`/api/family?patientId=${patientId}`)
                if (res.ok) {
                    const data = await res.json()
                    setFamilyMembers(data)
                }
            } catch (e) {
                console.error("Could not load family members", e)
            }
        }

        fetchFamily()
    }, [router])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const getPhotoLabel = (url: string) => photoLabels.find(l => l.photoUrl === url)
    const activePhoto = activePhotoIndex !== null ? photoUrls[activePhotoIndex] : null

    // Check if a photo has all required labels filled
    const isPhotoLabelComplete = (url: string): boolean => {
        const label = getPhotoLabel(url)
        if (!label) return false
        return !!(
            label.description?.trim() &&
            label.setting?.trim() &&
            label.activities?.trim() &&
            label.facialExpressions?.trim()
        )
    }

    // Check if the last uploaded photo has all labels filled
    const canUploadMore = (): boolean => {
        const uploadedPhotos = photoUrls.filter(u => u && u.trim() !== '')
        if (uploadedPhotos.length === 0) return true // No photos yet, can upload first
        // Check if last uploaded photo has all fields filled
        const lastPhoto = uploadedPhotos[uploadedPhotos.length - 1]
        return isPhotoLabelComplete(lastPhoto)
    }

    // Wizard Navigation
    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1)
    }

    const prevStep = () => {
        if (step > 1) setStep(step - 1)
    }

    const isStepValid = () => {
        if (step === 1) {
            return formData.title.trim() !== '' &&
                formData.date !== '' &&
                formData.event !== '' &&
                formData.location !== ''
        }
        if (step === 3) {
            return selectedPeople.length > 0
        }
        if (step === 4) {
            return photoUrls.some(url => url.trim() !== '')
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const validPhotos = photoUrls.filter(url => url.trim() !== '')
        const uploadedPhotosCount = validPhotos.length

        // Validation for photo labels if photos exist
        if (uploadedPhotosCount > 0) {
            for (const url of validPhotos) {
                if (!isPhotoLabelComplete(url)) {
                    const msg = 'Please fill in all details for your uploaded photos before creating the memory.'
                    setError(msg)
                    setAlertConfig({
                        title: 'Almost there!',
                        message: msg
                    })
                    setShowAlert(true)
                    setLoading(false)
                    // Set active index to the first incomplete photo to help user fix it
                    const errorIndex = photoUrls.findIndex(u => u === url)
                    setActivePhotoIndex(errorIndex)
                    // Scroll to top to show the error message clearly
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                    return
                }
            }
        }

        const validPhotoLabels = photoLabels.filter(l => validPhotos.includes(l.photoUrl))

        const data = {
            title: formData.title,
            description: formData.description,
            photoUrls: validPhotos,
            photoLabels: validPhotoLabels,
            date: formData.date,
            event: formData.event,
            location: formData.location,
            people: selectedPeople.join(', '),
            importance: parseInt(formData.importance),
            patientId: Cookies.get('selectedPatientId')
        }

        if (!data.patientId) {
            setError('No patient selected. Please select a patient first.')
            setLoading(false)
            return
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    const renderStepContent = () => {
        switch (step) {
            case 1: // The Basics
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-neutral-900">The Basics</h2>
                            <p className="text-neutral-500">When and where did this happen?</p>
                        </div>
                        <div className="space-y-5">
                            {/* Memory Title - Full Width */}
                            <div className="group">
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Memory Title</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Tag className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-4 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-lg"
                                        placeholder="e.g. Onam 1998 at Grandma's House"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Date and Event Type - Side by Side */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group relative z-20">
                                    <label className="block text-sm font-bold text-neutral-700 mb-2">Date</label>
                                    <ModernDatePicker
                                        value={formData.date}
                                        onDateSelectAction={(date: string) => setFormData(prev => ({ ...prev, date }))}
                                        placeholder="Select date..."
                                    />
                                </div>
                                <div className="group relative z-10">
                                    <label className="block text-sm font-bold text-neutral-700 mb-2">Event Type</label>
                                    <ModernSelect
                                        value={formData.event}
                                        onSelectAction={(value: string) => setFormData(prev => ({ ...prev, event: value }))}
                                        options={eventCategories}
                                        placeholder="Select event..."
                                        icon={<Sparkles className="h-5 w-5 text-neutral-400" />}
                                    />
                                </div>
                            </div>

                            {/* Location - Full Width */}
                            <div className="group relative z-0">
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Location</label>
                                <ModernSelect
                                    value={formData.location}
                                    onSelectAction={(value: string) => setFormData(prev => ({ ...prev, location: value }))}
                                    options={locationOptions}
                                    placeholder="Select location..."
                                    icon={<MapPin className="h-5 w-5 text-neutral-400" />}
                                />
                            </div>
                        </div>
                    </div>
                )

            case 2: // The Story
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-neutral-900">The Story</h2>
                            <p className="text-neutral-500">Add some context to this memory.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Description (Optional)</label>
                                <div className="relative">
                                    <div className="absolute top-4 left-4 pointer-events-none">
                                        <AlignLeft className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-600 transition-colors" />
                                    </div>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-4 rounded-xl border border-neutral-200 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium min-h-[150px]"
                                        placeholder="What happened? Who was there? Any funny stories?"
                                    />
                                </div>
                            </div>
                            <div className="group relative z-10">
                                <label className="block text-sm font-bold text-neutral-700 mb-2">Importance</label>
                                <ModernSelect
                                    value={formData.importance}
                                    onSelectAction={(value: string) => setFormData(prev => ({ ...prev, importance: value }))}
                                    options={[
                                        { value: '5', label: '⭐⭐⭐⭐⭐ High' },
                                        { value: '3', label: '⭐⭐⭐ Medium' },
                                        { value: '1', label: '⭐ Low' }
                                    ]}
                                    placeholder="Select importance..."
                                    icon={<Heart className="h-5 w-5 text-neutral-400" />}
                                />
                            </div>
                        </div>
                    </div>
                )

            case 3: // The People
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-neutral-900">The People</h2>
                            <p className="text-neutral-500">Who is in this memory?</p>
                        </div>

                        <div className="space-y-6">
                            {/* Selected People */}
                            <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
                                {selectedPeople.map(person => (
                                    <span key={person} className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neutral-900 text-white text-sm font-bold shadow-sm animate-in zoom-in duration-200">
                                        {person}
                                        <button type="button" onClick={() => togglePerson(person)} className="hover:text-red-300 transition-colors">
                                            <X size={14} strokeWidth={3} />
                                        </button>
                                    </span>
                                ))}
                                {selectedPeople.length === 0 && (
                                    <span className="text-neutral-400 text-sm italic py-1.5">No one tagged yet</span>
                                )}
                            </div>

                            {/* Family Suggestions */}
                            {familyMembers.length > 0 && (
                                <div className="text-center">
                                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 block">Quick Add Family</span>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {familyMembers.map(member => (
                                            <button
                                                key={member.id}
                                                type="button"
                                                onClick={() => togglePerson(member.name)}
                                                disabled={selectedPeople.includes(member.name)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedPeople.includes(member.name)
                                                    ? 'bg-neutral-100 text-neutral-400 border-neutral-100 cursor-not-allowed'
                                                    : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
                                                    }`}
                                            >
                                                {member.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Input */}
                            <div className="relative max-w-sm mx-auto">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    value={customPerson}
                                    onChange={(e) => setCustomPerson(e.target.value)}
                                    onKeyDown={addCustomPerson}
                                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 py-3.5 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-neutral-400 font-medium"
                                    placeholder="Type name and press Enter..."
                                />
                            </div>
                        </div>
                    </div>
                )

            case 4: // Gallery & Insights
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-neutral-900">Gallery & Insights</h2>
                            <p className="text-neutral-500">Add photos and help the AI understand them.</p>
                        </div>

                        {/* Photo Box */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Show only photos that have been uploaded - iterate with index to prevent duplicates */}
                            {photoUrls.map((url, index) => {
                                // Skip empty slots
                                if (!url || url.trim() === '') return null

                                const uploadedPhotosCount = photoUrls.filter(u => u && u.trim() !== '').length

                                return (
                                    <div
                                        key={`photo-${index}`}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${activePhotoIndex === index
                                            ? 'border-primary-500 ring-4 ring-primary-100'
                                            : 'border-transparent hover:border-neutral-200'
                                            }`}
                                        onClick={() => setActivePhotoIndex(index)}
                                    >
                                        <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                        {getPhotoLabel(url)?.description && (
                                            <div className="absolute top-2 left-2 bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-md z-10">
                                                ✓
                                            </div>
                                        )}
                                        {uploadedPhotosCount > 1 && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removePhotoField(index)
                                                }}
                                                className="absolute top-2 right-2 bg-white/90 text-neutral-500 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-sm hover:text-red-500 hover:bg-white transition-colors z-10"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                )
                            })}

                            {/* Single Add Photo Button - with validation */}
                            {photoUrls.filter(url => url && url.trim() !== '').length < 10 && (
                                canUploadMore() ? (
                                    <div className="aspect-square rounded-2xl border-2 border-dashed border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all overflow-hidden">
                                        <ImageUpload
                                            key={`add-photo-${photoUrls.filter(u => u && u.trim() !== '').length}`}
                                            bucket="memories"
                                            onUpload={(newUrl) => {
                                                // Add new photo to the array
                                                setPhotoUrls(prev => {
                                                    // Remove empty slots first, then add the new URL
                                                    const nonEmpty = prev.filter(u => u && u.trim() !== '')
                                                    return [...nonEmpty, newUrl]
                                                })
                                                // Set active to the new photo
                                                const currentUploaded = photoUrls.filter(u => u && u.trim() !== '').length
                                                setActivePhotoIndex(currentUploaded)
                                            }}
                                            label="Add Photo"
                                            compact={true}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="aspect-square rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/50 flex flex-col items-center justify-center text-amber-600 p-4 cursor-pointer hover:bg-amber-50 transition-all"
                                        onClick={() => {
                                            // Select the last photo to fill its details
                                            const uploadedPhotos = photoUrls.filter(u => u && u.trim() !== '')
                                            if (uploadedPhotos.length > 0) {
                                                const lastIndex = photoUrls.findIndex(u => u === uploadedPhotos[uploadedPhotos.length - 1])
                                                setActivePhotoIndex(lastIndex)
                                            }
                                        }}
                                    >
                                        <span className="text-2xl mb-1">⚠️</span>
                                        <span className="text-xs font-bold text-center">Fill previous photo details first</span>
                                    </div>
                                )
                            )}
                        </div>

                        {/* AI Labeling Panel (Overlay/Modal style for mobile, inline for desktop) */}
                        <div className={`mt-6 bg-neutral-900 rounded-[2rem] p-6 text-white shadow-xl transition-all duration-500 ${activePhoto ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none grayscale'}`}>
                            {activePhoto ? (
                                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold flex items-center gap-2">
                                            <Tag size={18} className="text-primary-400" />
                                            Photo details
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => setActivePhotoIndex(null)}
                                            className="text-neutral-400 hover:text-white"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="aspect-video rounded-xl bg-black/50 overflow-hidden relative border border-white/10">
                                            <img src={activePhoto} alt="Selected" className="w-full h-full object-contain" />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Who's in this?</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedPeople.map(person => {
                                                        const isInPhoto = getPhotoLabel(activePhoto)?.people?.includes(person)
                                                        return (
                                                            <button
                                                                key={person}
                                                                type="button"
                                                                onClick={() => togglePhotoPerson(activePhoto, person)}
                                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isInPhoto
                                                                    ? 'bg-primary-600 border-primary-600 text-white'
                                                                    : 'bg-transparent border-white/20 text-neutral-400 hover:border-white/50 hover:text-white'
                                                                    }`}
                                                            >
                                                                {person}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">What's happening?</label>
                                                <textarea
                                                    value={getPhotoLabel(activePhoto)?.description || ''}
                                                    onChange={(e) => updatePhotoLabel(activePhoto, 'description', e.target.value)}
                                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm text-white min-h-[60px]"
                                                    placeholder="e.g., Family eating Onam sadhya together"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Setting</label>
                                                <ModernSelect
                                                    value={getPhotoLabel(activePhoto)?.setting || ''}
                                                    onSelectAction={(val) => updatePhotoLabel(activePhoto, 'setting', val)}
                                                    options={settingOptions}
                                                    placeholder="Select setting..."
                                                    variant="dark"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Activity</label>
                                                <ModernSelect
                                                    value={getPhotoLabel(activePhoto)?.activities || ''}
                                                    onSelectAction={(val) => updatePhotoLabel(activePhoto, 'activities', val)}
                                                    options={activityOptions}
                                                    placeholder="Select activity..."
                                                    variant="dark"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Mood / Expression</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {moodOptions.map(mood => {
                                                        const isSelected = getPhotoLabel(activePhoto)?.facialExpressions === mood
                                                        return (
                                                            <button
                                                                key={mood}
                                                                type="button"
                                                                onClick={() => updatePhotoLabel(activePhoto, 'facialExpressions', mood)}
                                                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${isSelected
                                                                    ? 'bg-primary-600 border-primary-600 text-white'
                                                                    : 'bg-transparent border-white/20 text-neutral-400 hover:border-white/50 hover:text-white'
                                                                    }`}
                                                            >
                                                                {mood}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-neutral-500">
                                    <p className="text-sm">Select a photo above to add details.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl">

                {/* Header / Progress */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-bold transition-colors"
                            >
                                <ChevronLeft size={20} />
                                <span>Back</span>
                            </button>
                        ) : (
                            <Link href="/dashboard/memories" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 font-bold transition-colors">
                                <ChevronLeft size={20} />
                                <span>Back</span>
                            </Link>
                        )}
                        <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                            Step {step} of {totalSteps}
                        </span>
                    </div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-indigo-100/50 border border-neutral-100 relative min-h-[600px] flex flex-col">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10" />

                    <form
                        onSubmit={handleSubmit}
                        onKeyDown={handleEnterKeyNavigation}
                        className="relative z-10 flex flex-col flex-grow"
                    >
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <div className="flex-grow relative z-30">
                            {renderStepContent()}
                        </div>

                        <div className="flex gap-4 mt-8 pt-6 border-t border-neutral-100 relative z-0">
                            {step > 1 && (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="flex-1 py-4 rounded-xl border-2 border-neutral-100 font-bold text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <ChevronLeft size={20} />
                                    Back
                                </button>
                            )}

                            {step < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!isStepValid()}
                                    className="flex-1 py-4 rounded-xl bg-neutral-900 text-white font-bold shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
                                >
                                    {loading ? 'Moving Next...' : 'Next Step'}
                                    {!loading && <ChevronRight size={20} />}
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {loading ? 'Saving...' : 'Create Memory'}
                                    {!loading && <Check size={20} />}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <PremiumAlert
                isOpen={showAlert}
                onCloseAction={() => setShowAlert(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                type="error"
            />
        </div>
    )
}
