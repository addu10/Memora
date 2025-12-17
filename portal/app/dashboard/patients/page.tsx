// Patients List Page with Delete Option
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import DeletePatientButton from './DeletePatientButton'

export default async function PatientsPage() {
  const session = await getSession()
  if (!session) return null

  const patients = await prisma.patient.findMany({
    where: { caregiverId: session.userId },
    include: {
      _count: {
        select: { sessions: true, memories: true, familyMembers: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="patients-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Patients</h1>
          <p className="page-subtitle">Your loved ones receiving therapy</p>
        </div>
        <Link href="/dashboard/patients/new" className="btn btn-primary">
          + Add Patient
        </Link>
      </div>

      {patients.length > 0 ? (
        <div className="patients-grid">
          {patients.map((patient) => (
            <div key={patient.id} className="patient-card">
              <div className="patient-header">
                <div className="patient-avatar">
                  {patient.name.charAt(0)}
                </div>
                <div className="patient-info-text">
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-meta">Age {patient.age} years</div>
                </div>
              </div>

              {patient.diagnosis && (
                <p className="patient-diagnosis">{patient.diagnosis}</p>
              )}

              <div className="patient-stats">
                <div className="stat-item">
                  <div className="stat-value">{patient.mmseScore || '--'}</div>
                  <div className="stat-label">MMSE</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{patient._count.sessions}</div>
                  <div className="stat-label">Sessions</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{patient._count.memories}</div>
                  <div className="stat-label">Memories</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{patient._count.familyMembers}</div>
                  <div className="stat-label">Family</div>
                </div>
              </div>

              <div className="patient-actions">
                <Link href={`/dashboard/patients/${patient.id}`} className="btn btn-secondary">
                  View Details
                </Link>
                <DeletePatientButton patientId={patient.id} patientName={patient.name} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h2 className="empty-title">No Patients Yet</h2>
          <p className="empty-text">
            Add your first patient to start reminiscence therapy sessions.
          </p>
          <Link href="/dashboard/patients/new" className="btn btn-primary btn-lg">
            Add Your First Patient
          </Link>
        </div>
      )}
    </div>
  )
}
