'use client'

// Patient Selection Modal - Animated modal for selecting active patient
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Patient {
    id: string
    name: string
    age: number
    photoUrl?: string | null
}

interface PatientSelectionModalProps {
    patients: Patient[]
    isOpen: boolean
    onClose?: () => void
}

export default function PatientSelectionModal({ patients, isOpen, onClose }: PatientSelectionModalProps) {
    const router = useRouter()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isSelecting, setIsSelecting] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (isOpen) {
            // Trigger entrance animation
            setTimeout(() => setIsAnimating(true), 50)
        } else {
            setIsAnimating(false)
        }
    }, [isOpen])

    const handleSelect = async (patientId: string) => {
        setSelectedId(patientId)
        setIsSelecting(true)

        try {
            await fetch('/api/patient/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId })
            })

            // Brief delay for visual feedback
            await new Promise(resolve => setTimeout(resolve, 500))

            router.refresh()
            onClose?.()
        } catch (error) {
            console.error('Failed to select patient:', error)
        } finally {
            setIsSelecting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className={`patient-modal-overlay ${isAnimating ? 'visible' : ''}`}>
            <div className={`patient-modal ${isAnimating ? 'visible' : ''}`}>
                <div className="patient-modal-header">
                    <div className="modal-icon">👋</div>
                    <h2>Who are you caring for today?</h2>
                    <p>Select a patient to continue</p>
                </div>

                <div className="patient-cards-grid">
                    {patients.map((patient, index) => (
                        <button
                            key={patient.id}
                            className={`patient-card ${selectedId === patient.id ? 'selected' : ''}`}
                            onClick={() => handleSelect(patient.id)}
                            disabled={isSelecting}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="patient-card-avatar">
                                {patient.photoUrl ? (
                                    <img src={patient.photoUrl} alt={patient.name} />
                                ) : (
                                    <span>{patient.name.charAt(0).toUpperCase()}</span>
                                )}
                                {selectedId === patient.id && (
                                    <div className="selected-check">✓</div>
                                )}
                            </div>
                            <div className="patient-card-info">
                                <h3>{patient.name}</h3>
                                <p>Age {patient.age}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {isSelecting && (
                    <div className="selecting-indicator">
                        <div className="spinner"></div>
                        <span>Loading...</span>
                    </div>
                )}
            </div>

            <style jsx>{`
                .patient-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .patient-modal-overlay.visible {
                    opacity: 1;
                }

                .patient-modal {
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 1.5rem;
                    padding: 2.5rem;
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                    transform: scale(0.9) translateY(20px);
                    opacity: 0;
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }

                .patient-modal.visible {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }

                .patient-modal-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .modal-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    animation: wave 1s ease-in-out infinite;
                }

                @keyframes wave {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(20deg); }
                    75% { transform: rotate(-10deg); }
                }

                .patient-modal-header h2 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--gray-900);
                    margin-bottom: 0.5rem;
                }

                .patient-modal-header p {
                    color: var(--gray-500);
                    font-size: 1rem;
                }
 Riverside.

                .patient-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .patient-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1.5rem;
                    border: 2px solid var(--gray-200);
                    border-radius: 1rem;
                    background: var(--gray-50);
                    color: var(--gray-800);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    animation: fadeInUp 0.5s ease forwards;
                    opacity: 0;
                    transform: translateY(20px);
                }

                @keyframes fadeInUp {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .patient-card:hover {
                    border-color: var(--primary-500);
                    background: var(--primary-50);
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.2);
                }

                .patient-card.selected {
                    border-color: var(--primary-500);
                    background: var(--purple-gradient);
                    color: white;
                }
 Riverside.
 Riverside.
 Riverside.
 Riverside.

                .patient-card.selected .patient-card-info p {
                    color: rgba(255, 255, 255, 0.8);
                }

                .patient-card-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: var(--purple-gradient);
 Riverside.
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 1rem;
                    position: relative;
                    overflow: hidden;
                }

                .patient-card.selected .patient-card-avatar {
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.4);
                }

                .patient-card-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .patient-card-avatar span {
                    font-size: 2rem;
                    font-weight: 700;
                    color: white;
                }

                .selected-check {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 28px;
                    height: 28px;
                    background: #10b981;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    border: 3px solid white;
                    animation: pop 0.3s ease;
                }

                @keyframes pop {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }

                .patient-card-info {
                    text-align: center;
                }

                .patient-card-info h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .patient-card-info p {
                    font-size: 0.875rem;
                    color: var(--gray-500);
                }
 Riverside.
 Riverside.
 Riverside.
 Riverside.
                .selecting-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    margin-top: 1.5rem;
                    padding: 1rem;
                    background: var(--gray-100);
                    border-radius: 0.75rem;
                    color: var(--gray-500);
                }
 Riverside.
 Riverside.
 Riverside.
 Riverside.
                .spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid var(--gray-200);
                    border-top-color: var(--primary-500);
                    border-radius: 50%;
 Riverside.
 Riverside.
 Riverside.
 Riverside.
                   animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
