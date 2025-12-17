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

    const handleDelete = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/patients/${patientId}`, {
                method: 'DELETE'
            })

            if (!res.ok) {
                throw new Error('Failed to delete patient')
            }

            // Close modal immediately
            setIsModalOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Delete failed:', error)
            alert('Failed to delete patient. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={loading}
                className="btn btn-danger" // Ensure this class exists or add style below
                style={{
                    background: '#EF4444',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'background 0.2s',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#DC2626'}
                onMouseOut={(e) => e.currentTarget.style.background = '#EF4444'}
            >
                🗑️ Delete
            </button>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Delete ${patientName}?`}
                primaryAction={{
                    label: loading ? 'Deleting...' : 'Yes, Delete',
                    onClick: handleDelete,
                    variant: 'danger'
                }}
            >
                <div className="space-y-4">
                    <p>Are you sure you want to delete this patient?</p>
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100">
                        <strong>Warning:</strong> This action cannot be undone. All associated data including:
                        <ul className="list-disc ml-5 mt-2 space-y-1">
                            <li>Memories and photos</li>
                            <li>Family member profiles</li>
                            <li>Therapy session records</li>
                        </ul>
                        will be permanently removed.
                    </div>
                </div>
            </Modal>
        </>
    )
}
