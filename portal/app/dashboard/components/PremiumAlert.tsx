'use client'

import { X, CheckCircle2, AlertCircle } from 'lucide-react'

interface PremiumAlertProps {
    isOpen: boolean
    onCloseAction: () => void
    title: string
    message: string
    type?: 'success' | 'error' | 'warning'
}

export default function PremiumAlert({
    isOpen,
    onCloseAction,
    title,
    message,
    type = 'error'
}: PremiumAlertProps) {
    if (!isOpen) return null

    const isError = type === 'error'
    const isSuccess = type === 'success'

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                onClick={onCloseAction}
            />

            {/* Alert Modal */}
            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-purple-500/20 border border-white/60 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-10" />

                <div className="p-8 md:p-10 flex flex-col items-center text-center">
                    {/* Icon Header */}
                    <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg rotate-3 ${isError ? 'bg-red-50 text-red-500 shadow-red-100' :
                        isSuccess ? 'bg-emerald-50 text-emerald-500 shadow-emerald-100' :
                            'bg-amber-50 text-amber-500 shadow-amber-100'
                        }`}>
                        {isError ? <AlertCircle size={40} /> : <CheckCircle2 size={40} />}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        {message}
                    </p>

                    <button
                        onClick={onCloseAction}
                        className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 ${isError ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-red-200' :
                            'bg-gradient-to-r from-primary-600 to-indigo-600 shadow-primary-200'
                            }`}
                    >
                        Got it, thanks!
                    </button>

                    <button
                        onClick={onCloseAction}
                        className="mt-4 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    )
}
