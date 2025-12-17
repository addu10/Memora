// Memories Page - Gallery and Upload
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

async function getMemories(patientId: string) {
    return prisma.memory.findMany({
        where: { patientId },
        orderBy: { date: 'desc' }
    })
}

export default async function MemoriesPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const cookieStore = await cookies()
    const patientId = cookieStore.get('selectedPatientId')?.value

    // Get first patient if none selected
    let patient = null
    if (patientId) {
        patient = await prisma.patient.findFirst({
            where: { id: patientId, caregiverId: session.userId }
        })
    }

    if (!patient) {
        const firstPatient = await prisma.patient.findFirst({
            where: { caregiverId: session.userId }
        })
        if (!firstPatient) {
            return (
                <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h2 className="empty-title">No Patient Added Yet</h2>
                    <p className="empty-text">Add a patient first to start uploading memories.</p>
                    <Link href="/dashboard/patients/new" className="btn btn-primary">Add Patient</Link>
                </div>
            )
        }
        patient = firstPatient
    }

    const memories = await getMemories(patient.id)

    // Group memories by event
    const eventGroups: Record<string, typeof memories> = {}
    memories.forEach(memory => {
        if (!eventGroups[memory.event]) {
            eventGroups[memory.event] = []
        }
        eventGroups[memory.event].push(memory)
    })

    return (
        <div className="memories-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Memories</h1>
                    <p className="page-subtitle">Photo memories for {patient.name}</p>
                </div>
                <Link href="/dashboard/memories/new" className="btn btn-primary">
                    + Add Memory
                </Link>
            </div>

            {/* Event Filter Tabs */}
            <div className="event-tabs">
                <button className="event-tab active">All Events</button>
                {Object.keys(eventGroups).map(event => (
                    <button key={event} className="event-tab">{event}</button>
                ))}
            </div>

            {memories.length > 0 ? (
                <div className="memories-grid">
                    {memories.map(memory => (
                        <Link href={`/dashboard/memories/${memory.id}`} key={memory.id} className="memory-card block hover:shadow-lg transition-shadow">
                            <div className="memory-image">
                                {memory.photoUrls && memory.photoUrls.length > 0 ? (
                                    <img src={memory.photoUrls[0]} alt={memory.title} />
                                ) : (
                                    <div className="memory-placeholder">🖼️</div>
                                )}
                            </div>
                            <div className="memory-info">
                                <h3 className="memory-title">{memory.title}</h3>
                                <div className="memory-meta">
                                    <span className="memory-event">{memory.event}</span>
                                    <span className="memory-date">
                                        {new Date(memory.date).toLocaleDateString('en-IN', {
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <p className="memory-people">👥 {memory.people}</p>
                                <div className="memory-importance">
                                    {'⭐'.repeat(memory.importance)}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">🖼️</div>
                    <h2 className="empty-title">No Memories Yet</h2>
                    <p className="empty-text">
                        Upload photos from special occasions to use in therapy sessions.
                    </p>
                    <Link href="/dashboard/memories/new" className="btn btn-primary btn-lg">
                        Add First Memory
                    </Link>
                </div>
            )}
        </div>
    )
}
