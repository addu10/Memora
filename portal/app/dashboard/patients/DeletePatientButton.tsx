'use client'

// Delete Patient Button Component
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/app/components/Modal'

interface DeletePatientButtonProps {
    patientId: string
    patientName: string
}

export default function DeletePatientButton({ patientId, patientName }: DeletePatientButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [confirmName, setConfirmName] = useState('')

    const handleDelete = async () => {
        if (confirmName !== patientName) return

        setLoading(true)
        try {
            const res = await fetch(`/api/patients/${patientId}`, {
                method: 'DELETE'
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to delete patient')
            }

            // Close modal and redirect to patients list
            setIsModalOpen(false)
            router.push('/dashboard/patients')
            router.refresh()
        } catch (error: any) {
            console.error('Delete failed:', error)
            alert(error.message || 'Failed to delete patient. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                className="btn-danger-action"
            >
                <div className="icon-badge">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                </div>
                <span>Delete Data</span>
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setConfirmName('')
                }}
                title="Security Verification"
                primaryAction={{
                    label: loading ? 'Deleting...' : 'Confirm Deletion',
                    onClick: handleDelete,
                    variant: 'danger',
                    disabled: confirmName !== patientName || loading
                }}
            >
                <div className="delete-modal-content">
                    <div className="alert-card">
                        <div className="alert-header">
                            <span className="alert-icon">⚠️</span>
                            <h4>Critical Action Required</h4>
                        </div>
                        <p>
                            Deleting <strong>{patientName}</strong> will permanently erase all therapy sessions, 3D memories, and family photos from our servers.
                        </p>
                    </div>

                    <div className="confirmation-flow">
                        <label>Authorized Personnel Only</label>
                        <p className="hint">Type <strong>{patientName}</strong> to authorize this purge:</p>
                        <input
                            type="text"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder="Patient name"
                            className="security-input"
                            autoFocus
                        />
                    </div>
                </div>
            </Modal>

            <style jsx>{`
                .btn-danger-action {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 18px;
                    background: var(--accent-50);
                    color: var(--accent-600);
                    border: 1px solid var(--accent-100);
                    border-radius: 100px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .btn-danger-action:hover {
                    background: var(--accent-100);
                    border-color: var(--accent-500);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(244, 63, 94, 0.15);
                }

                .icon-badge {
                    width: 28px;
                    height: 28px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(244, 63, 94, 0.1);
                    color: var(--accent-500);
                }

                .delete-modal-content {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .alert-card {
                    background: linear-gradient(135deg, #fff1f2 0%, #fff5f5 100%);
                    border: 2px dashed var(--accent-200);
                    border-radius: 1.5rem;
                    padding: 1.5rem;
                }

                .alert-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .alert-icon {
                    font-size: 1.5rem;
                }

                .alert-header h4 {
                    color: var(--accent-700);
                    margin: 0;
                    font-weight: 700;
                    font-size: 0.85rem;
                }

                .alert-card p {
                    font-size: 1rem;
                    color: #7f1d1d;
                    margin: 0;
                    line-height: 1.5;
                }

                .confirmation-flow {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .confirmation-flow label {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--gray-500);
                }

                .confirmation-flow .hint {
                    font-size: 1rem;
                    color: var(--gray-600);
                    margin: 0;
                }

                .security-input {
                    width: 100%;
                    padding: 1rem;
                    border-radius: 1.25rem;
                    border: 2px solid var(--gray-100);
                    background: var(--gray-50);
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--gray-900);
                    outline: none;
                    transition: all 0.3s;
                    text-align: center;
                }

                .security-input:focus {
                    border-color: var(--primary-400);
                    background: white;
                    box-shadow: 0 0 0 4px var(--primary-50);
                }
            `}</style>
        </>
    )
}
