import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import ImageSlideshow from '@/app/dashboard/components/ImageSlideshow'

export default async function MemoryDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession()
    if (!session) redirect('/login')

    const { id } = await params

    // Get memory with patient info
    const { data: memory, error } = await supabaseAdmin
        .from('Memory')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !memory) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Memory Not Found</h2>
                <Link href="/dashboard/memories" className="btn btn-primary">
                    &larr; Return to Gallery
                </Link>
            </div>
        )
    }

    // Get patient to verify ownership
    const { data: patient } = await supabaseAdmin
        .from('Patient')
        .select('*')
        .eq('id', memory.patientId)
        .single()

    if (!patient || patient.caregiverId !== session.userId) {
        return <div className="text-red-500 font-bold text-center py-20">Unauthorized Access</div>
    }

    const photos = memory.photoUrls || []

    return (
        <div className="memory-detail-page">
            <div className="memory-header">
                <div>
                    <h1 className="memory-title">{memory.title}</h1>
                    <p className="memory-date" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {new Date(memory.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <Link href="/dashboard/memories" className="btn btn-secondary">
                    Back
                </Link>
            </div>

            <div className="memory-grid">

                {/* Visuals */}
                <div>
                    <ImageSlideshow images={photos} title={memory.title} />

                    <div className="therapy-tip">
                        <div className="tip-header">
                            <span className="tip-icon" style={{ background: '#fefce8', color: '#854d0e', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </span>
                            <h3 className="tip-title">Clinical Tip</h3>
                        </div>
                        <p className="tip-text">
                            Help <strong>{patient.name}</strong> recall by asking:
                            <br />
                            <em>"Do you remember who was with us at the {memory.event}?"</em>
                        </p>
                    </div>
                </div>

                {/* Details */}
                <div>
                    <span className="event-badge">{memory.event}</span>

                    <div className="memory-description">
                        <p>{memory.description || "No detailed description added yet."}</p>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: 'var(--space-lg) 0' }} />

                    <div className="detail-row">
                        <div>
                            <label className="detail-label">Location</label>
                            <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                                </svg>
                                {memory.location}
                            </div>
                        </div>
                        <div>
                            <label className="detail-label">People Tagged</label>
                            <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                {memory.people}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="detail-label">Recall Importance</label>
                        <div className="importance-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${star <= memory.importance ? 'filled' : ''}`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
