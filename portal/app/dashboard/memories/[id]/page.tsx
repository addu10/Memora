import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import ImageSlideshow from '@/app/dashboard/components/ImageSlideshow'

export default async function MemoryDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession()
    if (!session) redirect('/login')

    const memory = await prisma.memory.findUnique({
        where: { id: params.id },
        include: { patient: true }
    })

    if (!memory) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Memory Not Found</h2>
                <Link href="/dashboard/memories" className="btn btn-primary">
                    &larr; Return to Gallery
                </Link>
            </div>
        )
    }

    if (memory.patient.caregiverId !== session.userId) {
        return <div className="text-red-500 font-bold text-center py-20">Unauthorized Access</div>
    }

    const photos = memory.photoUrls || []

    return (
        <div className="memory-detail-page">
            <div className="memory-header">
                <div>
                    <h1 className="memory-title">{memory.title}</h1>
                    <p className="memory-date">
                        📅 {new Date(memory.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
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
                            <span className="tip-icon">💡</span>
                            <h3 className="tip-title">Therapy Tip</h3>
                        </div>
                        <p className="tip-text">
                            Show these photos to <strong>{memory.patient.name}</strong> and ask:
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
                            <div className="detail-value">
                                📍 {memory.location}
                            </div>
                        </div>
                        <div>
                            <label className="detail-label">People Tagged</label>
                            <div className="detail-value">
                                👥 {memory.people}
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

