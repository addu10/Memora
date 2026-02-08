'use client'

import { useEffect, useState } from 'react'

interface AuthLoadingOverlayProps {
    message?: string
    onComplete?: () => void
}

export default function AuthLoadingOverlay({ message = 'Loading your experience', onComplete }: AuthLoadingOverlayProps) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        // Smooth progress animation over 3 seconds
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval)
                    // Trigger redirect when bar is full
                    if (onComplete) {
                        setTimeout(() => onComplete(), 200)
                    }
                    return 100
                }
                return prev + 2
            })
        }, 60)

        return () => clearInterval(progressInterval)
    }, [onComplete])

    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
            {/* Beautiful Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-200 via-indigo-100 to-purple-200" />

            {/* Animated floating orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-300/40 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300/40 rounded-full blur-3xl animate-pulse delay-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center gap-12">

                {/* Center Logo */}
                <div className="w-24 h-24 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-violet-300/50 flex items-center justify-center">
                    <img
                        src="/images/logo-full.jpg"
                        alt="Memora"
                        className="w-14 h-14 object-contain"
                    />
                </div>

                {/* Text Content */}
                <div className="text-center space-y-3">
                    <h1 className="text-2xl font-bold text-slate-700 tracking-tight">
                        {message}
                    </h1>
                    <p className="text-violet-600/80 font-semibold text-xs uppercase tracking-[0.25em]">
                        Memora Reminiscence Therapy
                    </p>
                </div>

                {/* Unique Progress Indicator - Segmented Bar */}
                <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 w-12 rounded-full transition-all duration-500 ${progress >= (i + 1) * 20
                                    ? 'bg-gradient-to-r from-violet-500 to-indigo-500 shadow-md shadow-violet-500/30'
                                    : 'bg-white/50 backdrop-blur-sm'
                                }`}
                        />
                    ))}
                </div>

            </div>
        </div>
    )
}
