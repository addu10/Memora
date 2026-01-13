'use client'

// Dashboard Client Wrapper - Handles client-side modal logic
import { useState, useEffect } from 'react'
import PatientSelectionModal from './PatientSelectionModal'

interface Patient {
    id: string
    name: string
    age: number
    photoUrl?: string | null
}

interface DashboardClientWrapperProps {
    patients: Patient[]
    selectedPatientId: string | undefined
    children: React.ReactNode
}

export default function DashboardClientWrapper({
    patients,
    selectedPatientId,
    children
}: DashboardClientWrapperProps) {
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        // Show modal if there are patients but none is selected
        if (patients.length > 0 && !selectedPatientId) {
            setShowModal(true)
        }
    }, [patients, selectedPatientId])

    return (
        <>
            {children}
            <PatientSelectionModal
                patients={patients}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>
    )
}
