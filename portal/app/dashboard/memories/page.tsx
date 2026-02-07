// Memories Page - Gallery and Upload
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function MemoriesPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const cookieStore = await cookies()
    const patientId = cookieStore.get('selectedPatientId')?.value

    // Get first patient if none selected
    let patient = null
    if (patientId) {
        const { data } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('id', patientId)
            .eq('caregiverId', session.userId)
            .single()
        patient = data
    }

    if (!patient) {
        const { data: firstPatient } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('caregiverId', session.userId)
            .limit(1)
            .single()

        if (!firstPatient) {
            return (
                <div className="empty-state">
                    <div className="empty-icon" style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'center' }}>
                        <img src="/icons/patients.png" alt="" className="logo-icon-lg" />
                    </div>
                    <h2 className="empty-title">No Patient Added Yet</h2>
                    <p className="empty-text">Add a patient first to start uploading memories.</p>
                    <Link href="/dashboard/patients/new" className="btn btn-primary">Add Patient</Link>
                </div>
            )
        }
        patient = firstPatient
    }

    // Get memories for patient
    const { data: memories } = await supabaseAdmin
        .from('Memory')
        .select('*')
        .eq('patientId', patient.id)
        .order('date', { ascending: false })

    const memoryList = memories || []

    // Group memories by event
    const eventGroups: Record<string, typeof memoryList> = {}
    memoryList.forEach(memory => {
        if (!eventGroups[memory.event]) {
            eventGroups[memory.event] = []
        }
        eventGroups[memory.event].push(memory)
    })

    return (
        <div className="memories-page">
            <div className="page-header" style={{ marginBottom: 'var(--space-xl)' }}>
                <div>
                    <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Digital Memories</h1>
                    <p className="page-subtitle" style={{ fontSize: '1.1rem', color: 'var(--gray-600)' }}>Curated reminisence gallery for {patient.name}</p>
                </div>
                <Link href="/dashboard/memories/new" className="btn btn-primary" style={{ padding: 'var(--space-md) var(--space-xl)' }}>
                    + Add New Memory
                </Link>
            </div>

            {/* Event Filter Tabs */}
            <div className="event-tabs" style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)', overflowX: 'auto', paddingBottom: 'var(--space-sm)' }}>
                <button className="event-tab active" style={{
                    background: 'var(--primary-600)',
                    color: 'white',
                    padding: 'var(--space-sm) var(--space-lg)',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    fontWeight: 600,
                    boxShadow: 'var(--shadow-md)'
                }}>All Memories</button>
                {Object.keys(eventGroups).map(event => (
                    <button key={event} className="event-tab" style={{
                        background: 'white',
                        color: 'var(--gray-600)',
                        padding: 'var(--space-sm) var(--space-lg)',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--gray-200)',
                        fontWeight: 500
                    }}>{event}</button>
                ))}
            </div>

            {memoryList.length > 0 ? (
                <div className="memories-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-xl)' }}>
                    {memoryList.map(memory => (
                        <Link href={`/dashboard/memories/${memory.id}`} key={memory.id} className="stat-card" style={{
                            padding: 0,
                            background: 'white',
                            textDecoration: 'none',
                            transition: 'all 0.4s ease'
                        }}>
                            <div className="memory-image" style={{ height: '220px', position: 'relative', overflow: 'hidden' }}>
                                {memory.photoUrls && memory.photoUrls.length > 0 ? (
                                    <img src={memory.photoUrls[0]} alt={memory.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div className="memory-placeholder" style={{ background: 'var(--primary-50)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src="/icons/memories.png" alt="" className="premium-icon" style={{ width: '3rem', height: '3rem' }} />
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    top: 'var(--space-sm)',
                                    right: 'var(--space-sm)',
                                    background: 'rgba(255,255,255,0.9)',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: 'var(--primary-700)'
                                }}>{memory.event}</div>
                            </div>
                            <div className="memory-info" style={{ padding: 'var(--space-lg)' }}>
                                <h3 className="memory-title" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 'var(--space-xs)', color: 'var(--gray-900)' }}>{memory.title}</h3>
                                <div className="memory-meta" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                                    <span className="memory-date">
                                        {new Date(memory.date).toLocaleDateString('en-IN', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                    <div className="memory-importance" style={{ display: 'flex', gap: '2px' }}>
                                        {[...Array(memory.importance)].map((_, i) => (
                                            <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                                    <img src="/icons/family.png" alt="" className="premium-icon" style={{ width: '1rem', height: '1rem' }} />
                                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{memory.people}</span>
                                </div>
                                <div style={{ marginTop: 'var(--space-lg)', textAlign: 'right' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-600)' }}>View Details →</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="stat-card" style={{ textAlign: 'center', padding: 'var(--space-2xl)', background: 'white' }}>
                    <div style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'center' }}>
                        <img src="/icons/memories.png" alt="" className="logo-icon-lg" />
                    </div>
                    <h2 className="empty-title">Capture Your First Memory</h2>
                    <p className="empty-text" style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-xl)' }}>
                        Building a bridge to the past starts with a single photo. Add a memory to begin.
                    </p>
                    <Link href="/dashboard/memories/new" className="btn btn-primary btn-lg">
                        Add My First Memory
                    </Link>
                </div>
            )}
        </div>
    )
}
