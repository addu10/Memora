// Family Members Page
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function FamilyPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const cookieStore = await cookies()
    const patientId = cookieStore.get('selectedPatientId')?.value

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
                    <div className="empty-icon-3d">
                        <img src="/icons/patients.png" alt="" className="empty-img" />
                    </div>
                    <h2 className="empty-title">No Patient Added Yet</h2>
                    <p className="empty-text">Add a patient first to manage family members.</p>
                    <Link href="/dashboard/patients/new" className="btn btn-primary">Add Patient</Link>
                </div>
            )
        }
        patient = firstPatient
    }

    // Get family members
    const { data: familyMembers } = await supabaseAdmin
        .from('FamilyMember')
        .select('*')
        .eq('patientId', patient.id)
        .order('name', { ascending: true })

    const members = familyMembers || []

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

            {members.length > 0 ? (
                <div className="family-grid">
                    {members.map(member => {
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
                                        <span className="photo-label">Reference Photos:</span> <strong>{photoUrls.length}</strong>
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
                    <div className="empty-icon-3d">
                        <img src="/icons/family.png" alt="" className="empty-img" />
                    </div>
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
