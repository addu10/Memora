'use client'

// Patient Selector Component with Custom Dropdown
import { useState, useRef, useEffect } from 'react'
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
    const [isOpen, setIsOpen] = useState(false)
    const [isChanging, setIsChanging] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = async (patientId: string) => {
        if (patientId === selectedPatientId) {
            setIsOpen(false)
            return
        }

        setIsOpen(false)
        setIsChanging(true)

        try {
            await fetch('/api/patient/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId })
            })

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
        <div
            className={`patient-selector-container ${isChanging ? 'changing' : ''} ${showSuccess ? 'success' : ''}`}
            ref={dropdownRef}
        >
            <div className="selector-trigger" onClick={() => !isChanging && patients.length > 1 && setIsOpen(!isOpen)}>
                <label className="selector-label">Caring for:</label>
                <div className="selected-patient-display">
                    <span className="patient-avatar-sm">
                        {selectedPatient?.name.charAt(0)}
                    </span>
                    <span className="patient-name-display">{selectedPatient?.name}</span>
                    {patients.length > 1 && (
                        <svg
                            className={`dropdown-chevron ${isOpen ? 'rotated' : ''}`}
                            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    )}
                </div>

                {isChanging && (
                    <div className="selector-spinner-overlay">
                        <div className="selector-spinner" />
                    </div>
                )}
            </div>

            {isOpen && patients.length > 1 && (
                <div className="patient-dropdown">
                    <div className="dropdown-header">
                        <span className="dropdown-label">Switch Patient</span>
                    </div>
                    <div className="dropdown-items">
                        {patients.map(patient => (
                            <button
                                key={patient.id}
                                className={`dropdown-item ${patient.id === selectedPatientId ? 'active' : ''}`}
                                onClick={() => handleSelect(patient.id)}
                            >
                                <span className="patient-avatar-sm">
                                    {patient.name.charAt(0)}
                                </span>
                                <div className="patient-info">
                                    <span className="patient-name">{patient.name}</span>
                                    <span className="patient-age">Age {patient.age}</span>
                                </div>
                                {patient.id === selectedPatientId && (
                                    <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                .patient-selector-container {
                    position: relative;
                    transition: all 0.3s ease;
                }

                .selector-trigger {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: var(--space-sm) var(--space-lg);
                    background: var(--primary-50);
                    border-radius: var(--radius-full);
                    border: 1px solid var(--primary-100);
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    height: 48px; /* Match UserDropdown height */
                }

                .selector-trigger:hover {
                    background: var(--primary-100);
                    border-color: var(--primary-200);
                }

                .selected-patient-display {
                    display: flex;
                    align-items: center;
                    gap: var(--space-sm);
                    white-space: nowrap;
                }

                .patient-name-display {
                    font-weight: 700;
                    color: var(--gray-900);
                    white-space: nowrap;
                }

                .dropdown-chevron {
                    color: var(--primary-400);
                    margin-left: 4px;
                    transition: transform 0.2s;
                }

                .dropdown-chevron.rotated {
                    transform: rotate(180deg);
                }

                .patient-dropdown {
                    position: absolute;
                    top: calc(100% + 10px);
                    left: 0;
                    width: 240px;
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-xl);
                    border: 1px solid var(--glass-border);
                    padding: var(--space-sm);
                    z-index: 1100;
                    animation: slideDown 0.2s ease-out;
               }

                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dropdown-header {
                    padding: var(--space-xs) var(--space-md);
                    margin-bottom: var(--space-xs);
                }

                .dropdown-label {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--gray-400);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .dropdown-items {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-md);
                    padding: 0.75rem var(--space-md);
                    border-radius: var(--radius-lg);
                    transition: all 0.2s;
                    background: none;
                    border: none;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    color: var(--gray-700);
                }

                .dropdown-item:hover {
                    background: var(--primary-50);
                    color: var(--primary-600);
                }

                .dropdown-item.active {
                    background: var(--primary-50);
                    color: var(--primary-700);
                }

                .patient-info {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .patient-name {
                    font-weight: 700;
                    font-size: 0.95rem;
                }

                .patient-age {
                    font-size: 0.8rem;
                    color: var(--gray-500);
                }

                .check-icon {
                    color: var(--success);
                }

                .selector-spinner-overlay {
                    position: absolute;
                    inset: 0;
                    background: var(--gray-100);
                    opacity: 0.5;
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
               }

                .selector-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid var(--primary-200);
                    border-top-color: var(--primary-600);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .patient-selector-container.changing {
                    opacity: 0.7;
                    pointer-events: none;
                }

                .patient-selector-container.success {
                    animation: pulse 0.3s ease;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `}</style>
        </div>
    )
}

