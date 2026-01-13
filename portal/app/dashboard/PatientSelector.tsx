'use client'

// Patient Selector Component with Animation
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Patient {
    id: string
    name: string
    age: number
    photoUrl?: string | null
}

interface PatientSelectorProps {
    patients: Patient[]
    selectedPatientId?: string
}

export default function PatientSelector({ patients, selectedPatientId }: PatientSelectorProps) {
    const router = useRouter()
    const [isChanging, setIsChanging] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const patientId = e.target.value
        setIsChanging(true)

        try {
            // Set cookie via API
            await fetch('/api/patient/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId })
            })

            // Show success animation
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 1500)

            router.refresh()
        } catch (error) {
            console.error('Failed to select patient:', error)
        } finally {
            setIsChanging(false)
        }
    }

    const selectedPatient = patients.find(p => p.id === selectedPatientId)

    return (
        <div className={`patient-selector ${isChanging ? 'changing' : ''} ${showSuccess ? 'success' : ''}`}>
            <label className="selector-label">Caring for:</label>
            {patients.length === 1 ? (
                <div className="single-patient">
                    <span className="patient-avatar-sm">
                        {selectedPatient?.name.charAt(0)}
                    </span>
                    <span className="patient-name-display">{selectedPatient?.name}</span>
                </div>
            ) : (
                <div className="selector-wrapper">
                    <select
                        value={selectedPatientId || ''}
                        onChange={handleChange}
                        className="patient-select"
                        disabled={isChanging}
                    >
                        {patients.map(patient => (
                            <option key={patient.id} value={patient.id}>
                                {patient.name} (Age {patient.age})
                            </option>
                        ))}
                    </select>
                    {isChanging && (
                        <div className="selector-spinner" />
                    )}
                    {showSuccess && (
                        <div className="selector-check">✓</div>
                    )}
                </div>
            )}

            <style jsx>{`
                .patient-selector {
                    transition: all 0.3s ease;
                }

                .patient-selector.changing {
                    opacity: 0.7;
                }

                .patient-selector.success {
                    animation: pulse 0.3s ease;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }

                .selector-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .selector-spinner {
                    position: absolute;
                    right: 30px;
                    width: 16px;
                    height: 16px;
                    border: 2px solid #e5e7eb;
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                .selector-check {
                    position: absolute;
                    right: 30px;
                    color: #10b981;
                    font-weight: bold;
                    animation: pop 0.3s ease;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @keyframes pop {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    )
}

