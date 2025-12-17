'use client'

// Patient Selector Component
import { useRouter } from 'next/navigation'

interface Patient {
    id: string
    name: string
    age: number
}

interface PatientSelectorProps {
    patients: Patient[]
    selectedPatientId?: string
}

export default function PatientSelector({ patients, selectedPatientId }: PatientSelectorProps) {
    const router = useRouter()

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const patientId = e.target.value

        // Set cookie via API
        await fetch('/api/patient/select', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patientId })
        })

        router.refresh()
    }

    const selectedPatient = patients.find(p => p.id === selectedPatientId)

    return (
        <div className="patient-selector">
            <label className="selector-label">Caring for:</label>
            {patients.length === 1 ? (
                <div className="single-patient">
                    <span className="patient-avatar-sm">
                        {selectedPatient?.name.charAt(0)}
                    </span>
                    <span className="patient-name-display">{selectedPatient?.name}</span>
                </div>
            ) : (
                <select
                    value={selectedPatientId || ''}
                    onChange={handleChange}
                    className="patient-select"
                >
                    {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                            {patient.name} (Age {patient.age})
                        </option>
                    ))}
                </select>
            )}
        </div>
    )
}
