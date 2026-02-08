'use client'

import { useState, useRef, useEffect } from 'react'
import { Settings, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserDropdownProps {
  userName: string
  userEmail?: string
}

export default function UserDropdown({ userName, userEmail }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSettingsClick = () => {
    setIsOpen(false)
    window.location.href = '/dashboard/settings'
  }

  const handleLogout = async () => {
    setIsOpen(false)
    console.log('Signing out...')
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Sign out error:', e)
    } finally {
      window.location.href = '/login'
    }
  }

  const firstName = userName.split(' ')[0]

  return (
    <div className="relative" ref={dropdownRef} style={{ pointerEvents: 'auto' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-2xl hover:bg-slate-50 transition-colors"
        type="button"
      >
        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
          {firstName[0]}
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[9999]"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
            <p className="text-sm font-bold text-slate-900 truncate">{userEmail || userName}</p>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors text-left cursor-pointer"
              type="button"
            >
              <Settings size={16} className="text-slate-400" />
              <span>Settings</span>
            </button>
            <div className="h-px bg-slate-100 my-1"></div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left cursor-pointer"
              type="button"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
