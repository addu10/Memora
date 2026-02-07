'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface LogoutButtonProps {
    children?: React.ReactNode
    className?: string
}

export default function LogoutButton({ children, className }: LogoutButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (loading) return

        setLoading(true)
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/login')
            router.refresh()
        } catch (error) {
            console.error('Logout failed:', error)
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className={className || "logout-btn"}
        >
            {loading ? 'Logging out...' : (children || 'Logout')}
        </button>
    )
}
