'use client'

// Delete Patient Button Component
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/app/components/Modal'
import { Trash2, AlertTriangle } from 'lucide-react'

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
                className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold hover:bg-red-100 hover:border-red-200 transition-all duration-300 group shadow-sm hover:shadow-md h-full"
                aria-label="Delete Patient"
            >
                <div className="w-5 h-5 flex items-center justify-center">
                    <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                </div>
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
                <div className="flex flex-col gap-6">
                    <div className="bg-red-50 border-2 border-dashed border-red-200 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle className="text-red-500" size={24} />
                            <h4 className="text-red-800 font-bold text-lg">Critical Action Required</h4>
                        </div>
                        <p className="text-red-700 font-medium leading-relaxed">
                            Deleting <strong>{patientName}</strong> will permanently erase all therapy sessions, 3D memories, and family photos from our servers.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Authorized Personnel Only</label>
                        <p className="text-neutral-600 mb-2">Type <strong>{patientName}</strong> to authorize this purge:</p>
                        <input
                            type="text"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder="Patient name"
                            className="w-full p-4 rounded-2xl border-2 border-neutral-200 bg-neutral-50 text-xl font-bold text-center text-neutral-900 focus:outline-none focus:border-red-400 focus:bg-white transition-all placeholder:text-neutral-300"
                            autoFocus
                        />
                    </div>
                </div>
            </Modal>
        </>
    )
}
