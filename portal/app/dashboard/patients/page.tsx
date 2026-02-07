// Patients List Page with Delete Option
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import DeletePatientButton from './DeletePatientButton'

export default async function PatientsPage() {
  const session = await getSession()
  if (!session) return null

  // Get patients with counts
  const { data: patientsRaw } = await supabaseAdmin
    .from('Patient')
    .select('*')
    .eq('caregiverId', session.userId)
    .order('updatedAt', { ascending: false })

  // Get counts for each patient
  const patients = await Promise.all(
    (patientsRaw || []).map(async (patient) => {
      const [sessionsCount, memoriesCount, familyCount] = await Promise.all([
        supabaseAdmin.from('TherapySession').select('id', { count: 'exact', head: true }).eq('patientId', patient.id),
        supabaseAdmin.from('Memory').select('id', { count: 'exact', head: true }).eq('patientId', patient.id),
        supabaseAdmin.from('FamilyMember').select('id', { count: 'exact', head: true }).eq('patientId', patient.id)
      ])
      return {
        ...patient,
        _count: {
          sessions: sessionsCount.count || 0,
          memories: memoriesCount.count || 0,
          familyMembers: familyCount.count || 0
        }
      }
    })
  )

  return (
    <div className="patients-page">
      <div className="page-header" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>Manage Patients</h1>
          <p className="page-subtitle" style={{ fontSize: '1.1rem', color: 'var(--gray-600)' }}>Your loved ones receiving clinical reminiscence therapy</p>
        </div>
        <Link href="/dashboard/patients/new" className="btn btn-primary" style={{ padding: 'var(--space-md) var(--space-xl)', fontSize: '1rem' }}>
          + Add New Patient
        </Link>
      </div>

      {patients.length > 0 ? (
        <div className="patients-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-xl)' }}>
          {patients.map((patient) => (
            <div key={patient.id} className="stat-card" style={{ padding: 'var(--space-xl)', background: 'white' }}>
              <div className="patient-header" style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                <div className="patient-avatar" style={{
                  width: '64px',
                  height: '64px',
                  fontSize: '1.5rem',
                  background: 'var(--purple-gradient)',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  {patient.name.charAt(0)}
                </div>
                <div className="patient-info-text">
                  <div className="patient-name" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{patient.name}</div>
                  <div className="patient-meta" style={{ color: 'var(--gray-500)' }}>Age {patient.age} · MMSE {patient.mmseScore || 'N/A'}</div>
                </div>
              </div>

              {patient.diagnosis && (
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: 'var(--primary-600)',
                    background: 'var(--primary-50)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)'
                  }}>Diagnosis</span>
                  <p className="patient-diagnosis" style={{ marginTop: '4px', fontStyle: 'italic', color: 'var(--gray-700)' }}>{patient.diagnosis}</p>
                </div>
              )}

              <div className="patient-stats" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-sm)',
                padding: 'var(--space-md)',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-lg)'
              }}>
                <div className="stat-item" style={{ textAlign: 'center' }}>
                  <div className="stat-value" style={{ fontSize: '1.2rem' }}>{patient._count.sessions}</div>
                  <div className="stat-label" style={{ fontSize: '0.65rem' }}>Sessions</div>
                </div>
                <div className="stat-item" style={{ textAlign: 'center' }}>
                  <div className="stat-value" style={{ fontSize: '1.2rem' }}>{patient._count.memories}</div>
                  <div className="stat-label" style={{ fontSize: '0.65rem' }}>Memories</div>
                </div>
                <div className="stat-item" style={{ textAlign: 'center' }}>
                  <div className="stat-value" style={{ fontSize: '1.2rem' }}>{patient._count.familyMembers}</div>
                  <div className="stat-label" style={{ fontSize: '0.65rem' }}>Family</div>
                </div>
              </div>

              <div className="patient-actions" style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <Link href={`/dashboard/patients/${patient.id}`} className="btn btn-secondary" style={{ flex: 1, fontWeight: 600 }}>
                  View Profile
                </Link>
                <DeletePatientButton patientId={patient.id} patientName={patient.name} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stat-card" style={{ textAlign: 'center', padding: 'var(--space-2xl)', background: 'white' }}>
          <div style={{ marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'center' }}>
            <img src="/icons/patients.png" alt="" className="logo-icon-lg" />
          </div>
          <h2 className="empty-title">No Patients Linked</h2>
          <p className="empty-text" style={{ marginBottom: 'var(--space-xl)', color: 'var(--gray-500)' }}>
            Start your journey by adding a loved one to provide them with clinical reminiscence therapy.
          </p>
          <Link href="/dashboard/patients/new" className="btn btn-primary btn-lg">
            Add Your First Patient
          </Link>
        </div>
      )}
    </div>
  )
}
