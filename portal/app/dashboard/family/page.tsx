// Family Members Page
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

async function getFamilyMembers(patientId: string) {
    return prisma.familyMember.findMany({
        where: { patientId },
        orderBy: { name: 'asc' }
    })
}

export default async function FamilyPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const cookieStore = await cookies()
    const patientId = cookieStore.get('selectedPatientId')?.value

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
                    <p className="empty-text">Add a patient first to manage family members.</p>
                    <Link href="/dashboard/patients/new" className="btn btn-primary">Add Patient</Link>
                </div>
            )
        }
        patient = firstPatient
    }

    const familyMembers = await getFamilyMembers(patient.id)

    return (
        <div className="family-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Family Members</h1>
                    <p className="page-subtitle">People for {patient.name} to recognize</p>
                </div>
                <Link href="/dashboard/family/new" className="btn btn-primary">
                    + Add Family Member
                </Link>
            </div>

            {familyMembers.length > 0 ? (
                <div className="family-grid">
                    {familyMembers.map(member => {
                        const photoUrls = member.photoUrls || []
                        return (
                            <div key={member.id} className="family-card">
                                <div className="family-avatar">
                                    {photoUrls.length > 0 ? (
                                        <img src={photoUrls[0]} alt={member.name} />
                                    ) : (
                                        <span>{member.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="family-info">
                                    <h3 className="family-name">{member.name}</h3>
                                    <p className="family-relation">{member.relationship}</p>
                                    <p className="family-photos">
                                        📷 {photoUrls.length} reference photo{photoUrls.length !== 1 ? 's' : ''}
                                    </p>
                                    {member.notes && (
                                        <p className="family-notes">{member.notes}</p>
                                    )}
                                </div>
                                <div className="family-actions">
                                    <Link href={`/dashboard/family/${member.id}/edit`} className="btn btn-secondary">
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">👨‍👩‍👧‍👦</div>
                    <h2 className="empty-title">No Family Members Yet</h2>
                    <p className="empty-text">
                        Add family members with their photos for face recognition during therapy.
                    </p>
                    <Link href="/dashboard/family/new" className="btn btn-primary btn-lg">
                        Add First Family Member
                    </Link>
                </div>
            )}
        </div>
    )
}
