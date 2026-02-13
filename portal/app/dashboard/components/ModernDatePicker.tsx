'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface ModernDatePickerProps {
    value: string
    onDateSelectAction: (value: string) => void
    placeholder?: string
}

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

export default function ModernDatePicker({ value, onDateSelectAction, placeholder = 'Select date' }: ModernDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const containerRef = useRef<HTMLDivElement>(null)

    // Parse the value to get selected date
    const selectedDate = value ? new Date(value) : null

    // Initialize current month view based on selected date or today
    useEffect(() => {
        if (selectedDate) {
            setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
        }
    }, [value])

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days: (Date | null)[] = []

        // Add empty slots for days before the first day
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev)
            if (direction === 'prev') {
                newMonth.setMonth(newMonth.getMonth() - 1)
            } else {
                newMonth.setMonth(newMonth.getMonth() + 1)
            }
            return newMonth
        })
    }

    const selectDate = (date: Date) => {
        const formattedDate = date.toISOString().split('T')[0]
        onDateSelectAction(formattedDate)
        setIsOpen(false)
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isSelected = (date: Date) => {
        if (!selectedDate) return false
        return date.toDateString() === selectedDate.toDateString()
    }

    const goToToday = () => {
        const today = new Date()
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    }

    const formatDisplayDate = () => {
        if (!selectedDate) return placeholder
        return selectedDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'Asia/Kolkata'
        })
    }

    const days = getDaysInMonth(currentMonth)

    return (
        <div className="relative" ref={containerRef} style={{ pointerEvents: 'auto' }}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full pl-11 pr-4 py-4 rounded-xl border text-left font-medium transition-all ${isOpen
                    ? 'border-primary-500 ring-2 ring-primary-500/20 bg-white'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                    } ${value ? 'text-neutral-900' : 'text-neutral-400'}`}
            >
                {formatDisplayDate()}
            </button>

            {/* Calendar Icon */}
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className={`h-5 w-5 transition-colors ${isOpen ? 'text-primary-600' : 'text-neutral-400'}`} />
            </div>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-neutral-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {/* Month Navigation Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-indigo-600 px-3 py-2.5">
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => navigateMonth('prev')}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="text-center">
                                <h3 className="text-sm font-bold text-white">
                                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => navigateMonth('next')}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 bg-neutral-50 border-b border-neutral-100">
                        {DAYS.map((day, i) => (
                            <div key={i} className="py-1.5 text-center text-[10px] font-bold text-neutral-400 uppercase">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-0.5 p-2">
                        {days.map((date, index) => (
                            <div key={index} className="aspect-square flex items-center justify-center">
                                {date ? (
                                    <button
                                        type="button"
                                        onClick={() => selectDate(date)}
                                        className={`w-8 h-8 rounded-lg font-medium text-xs transition-all ${isSelected(date)
                                            ? 'bg-primary-600 text-white shadow-md scale-105'
                                            : isToday(date)
                                                ? 'bg-primary-50 text-primary-700 border border-primary-200'
                                                : 'text-neutral-700 hover:bg-neutral-100'
                                            }`}
                                    >
                                        {date.getDate()}
                                    </button>
                                ) : (
                                    <span className="w-8 h-8" />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 border-t border-neutral-100">
                        <button
                            type="button"
                            onClick={() => {
                                onDateSelectAction('')
                                setIsOpen(false)
                            }}
                            className="text-xs font-bold text-neutral-500 hover:text-neutral-700 transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                selectDate(new Date())
                            }}
                            className="px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-all"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
