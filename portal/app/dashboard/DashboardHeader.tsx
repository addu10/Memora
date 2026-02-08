'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Calendar,
    Folder,
    BarChart2,
    Heart,
    ChevronDown
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import UserDropdown from './UserDropdown'

interface Patient {
    id: string
    name: string
    age: number
    photoUrl?: string | null
}

interface DashboardHeaderProps {
    user: { name: string, email?: string }
    patients: Patient[]
    selectedPatientId: string | undefined
}

export default function DashboardHeader({ user, patients, selectedPatientId }: DashboardHeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isCaringForOpen, setIsCaringForOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Close dropdowns when clicking outside
    const caringForRef = useRef<HTMLDivElement>(null)
    const mobileMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (caringForRef.current && !caringForRef.current.contains(event.target as Node)) {
                setIsCaringForOpen(false)
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSelectPatient = async (patientId: string) => {
        setIsCaringForOpen(false)
        try {
            await fetch('/api/patient/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId })
            })
            router.refresh()
        } catch (error) {
            console.error('Failed to select patient:', error)
        }
    }



    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
        setIsCaringForOpen(false)
    }, [pathname])

    const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0]

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
            <div className="relative group rounded-[2rem] p-[1px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-rose-500/20 shadow-lg shadow-indigo-500/5 pointer-events-auto max-w-[95%] w-full xl:max-w-6xl">
                <header className="bg-white/90 backdrop-blur-2xl rounded-[2rem] px-2 py-2 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700 relative z-50">

                    {/* 1. Logo Section */}
                    <Link href="/dashboard" className="flex items-center gap-3 pl-4 pr-6 border-r border-slate-100/50 hover:opacity-80 transition-opacity">
                        <div className="h-8">
                            <img src="/images/logo-full.jpg" alt="Memora" className="h-full w-auto object-contain mix-blend-multiply" />
                        </div>
                    </Link>

                    {/* 2. Navigation (Desktop) */}
                    <nav className="hidden lg:flex items-center justify-center gap-2 flex-1">
                        <NavItem href="/dashboard" label="Overview" active={pathname === '/dashboard'} />
                        <NavItem href="/dashboard/memories" label="Memories" active={pathname.startsWith('/dashboard/memories')} />
                        <NavItem href="/dashboard/family" label="Family" active={pathname.startsWith('/dashboard/family')} />
                        <NavItem href="/dashboard/sessions" label="Sessions" active={pathname.startsWith('/dashboard/sessions')} />
                        <NavItem href="/dashboard/progress" label="Analytics" active={pathname.startsWith('/dashboard/progress')} />
                        <NavItem href="/dashboard/patients" label="Patients" active={pathname.startsWith('/dashboard/patients') && !pathname.startsWith('/dashboard/patients/new')} />
                    </nav>

                    {/* 3. Right Side: Dropdowns (Actions) */}
                    <div className="hidden lg:flex items-center gap-2 pr-1">

                        {/* "Caring For" Dropdown (Squircle) */}
                        <div className="relative pointer-events-auto" ref={caringForRef}>
                            <button
                                onClick={() => setIsCaringForOpen(!isCaringForOpen)}
                                className="hidden md:flex items-center gap-3 bg-slate-50/80 px-4 py-2 rounded-2xl border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all h-10 group"
                                type="button"
                            >
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Caring For:</span>
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                        {selectedPatient ? selectedPatient.name[0] : '?'}
                                    </span>
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{selectedPatient ? selectedPatient.name : 'Select'}</span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isCaringForOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </button>

                            {isCaringForOpen && (
                                <div className="absolute top-full right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[9999] pointer-events-auto">
                                    <div className="p-2 space-y-1">
                                        {patients.map(patient => (
                                            <button
                                                key={patient.id}
                                                onClick={() => handleSelectPatient(patient.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors ${selectedPatientId === patient.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                                                type="button"
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${selectedPatientId === patient.id ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                                                    {patient.name[0]}
                                                </div>
                                                <span className="font-medium text-sm">{patient.name}</span>
                                                {selectedPatientId === patient.id && <span className="ml-auto text-indigo-600">✓</span>}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t border-slate-50 bg-slate-50/50">
                                        <Link href="/dashboard/patients/new" className="flex items-center justify-center w-full py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 shadow-sm transition-all">
                                            + Add New Patient
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Dropdown */}
                        <UserDropdown userName={user.name} userEmail={user.email} />
                    </div>

                    {/* 4. Mobile Menu Button */}
                    <div className="flex lg:hidden items-center gap-2">
                        {/* Mobile User Profile Dropdown */}
                        <UserDropdown userName={user.name} userEmail={user.email} />

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
                        >
                            {isMobileMenuOpen ? <div className="w-6 h-6 flex items-center justify-center font-bold">✕</div> : <div className="w-6 h-6 flex flex-col justify-center gap-1.5 items-center">
                                <span className="w-5 h-0.5 bg-slate-800 rounded-full"></span>
                                <span className="w-5 h-0.5 bg-slate-800 rounded-full"></span>
                                <span className="w-5 h-0.5 bg-slate-800 rounded-full"></span>
                            </div>}
                        </button>
                    </div>

                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="absolute top-[calc(100%+1rem)] left-0 right-0 p-4 bg-white/95 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 lg:hidden flex flex-col gap-2 z-40" ref={mobileMenuRef}>
                        <Link href="/dashboard" className={`p-4 rounded-xl font-bold flex items-center gap-3 ${pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                            <LayoutDashboard size={20} /> Overview
                        </Link>
                        <Link href="/dashboard/memories" className={`p-4 rounded-xl font-bold flex items-center gap-3 ${pathname.startsWith('/dashboard/memories') ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                            <Heart size={20} /> Memories
                        </Link>
                        <Link href="/dashboard/family" className={`p-4 rounded-xl font-bold flex items-center gap-3 ${pathname.startsWith('/dashboard/family') ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                            <Users size={20} /> Family
                        </Link>
                        <Link href="/dashboard/sessions" className={`p-4 rounded-xl font-bold flex items-center gap-3 ${pathname.startsWith('/dashboard/sessions') ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                            <Heart size={20} /> Sessions
                        </Link>
                        <Link href="/dashboard/progress" className={`p-4 rounded-xl font-bold flex items-center gap-3 ${pathname.startsWith('/dashboard/progress') ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                            <BarChart2 size={20} /> Analytics
                        </Link>
                        <Link href="/dashboard/patients" className={`p-4 rounded-xl font-bold flex items-center gap-3 ${pathname.startsWith('/dashboard/patients') ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                            <Users size={20} /> Patients
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}


function NavItem({ href, label, active = false }: { href: string, label: string, active?: boolean }) {
    return (
        <Link href={href} className={`px-5 py-2 rounded-2xl text-sm font-bold transition-all duration-300 relative group ${active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'}`}>
            {label}
        </Link>
    )
}
