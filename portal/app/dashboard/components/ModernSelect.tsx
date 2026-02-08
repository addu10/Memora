'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

type OptionItem = string | { value: string; label: string }

interface ModernSelectProps {
    value: string
    onSelectAction: (value: string) => void
    options: OptionItem[]
    placeholder?: string
    icon?: React.ReactNode
    variant?: 'light' | 'dark'
}

export default function ModernSelect({
    value,
    onSelectAction,
    options,
    placeholder = 'Select...',
    icon,
    variant = 'light'
}: ModernSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const isDark = variant === 'dark'

    // Normalize options to {value, label} format
    const normalizedOptions = options.map(opt =>
        typeof opt === 'string' ? { value: opt, label: opt } : opt
    )

    // Get display label for current value
    const getDisplayLabel = () => {
        const found = normalizedOptions.find(opt => opt.value === value)
        return found?.label || ''
    }

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

    const handleSelect = (optValue: string) => {
        onSelectAction(optValue)
        setIsOpen(false)
    }

    const displayValue = value ? getDisplayLabel() : placeholder

    // Style classes based on variant
    const triggerClasses = isDark
        ? `w-full ${icon ? 'pl-11' : 'pl-4'} pr-10 py-3 rounded-xl border text-left font-medium transition-all ${isOpen
            ? 'border-primary-500 ring-2 ring-primary-500/30 bg-white/10'
            : 'border-white/20 bg-white/5 hover:border-white/40'
        } ${value ? 'text-white' : 'text-neutral-400'}`
        : `w-full ${icon ? 'pl-11' : 'pl-4'} pr-10 py-4 rounded-xl border text-left font-medium transition-all ${isOpen
            ? 'border-primary-500 ring-2 ring-primary-500/20 bg-white'
            : 'border-neutral-200 bg-white hover:border-neutral-300'
        } ${value ? 'text-neutral-900' : 'text-neutral-400'}`

    const dropdownClasses = isDark
        ? 'absolute top-full left-0 right-0 mt-2 bg-neutral-800 rounded-xl shadow-xl border border-white/10 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150'
        : 'absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150'

    const optionClasses = (isSelected: boolean) => isDark
        ? `w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between ${isSelected
            ? 'bg-primary-600/30 text-primary-300'
            : 'text-neutral-300 hover:bg-white/10'
        }`
        : `w-full px-4 py-3 text-left text-sm font-medium transition-colors flex items-center justify-between ${isSelected
            ? 'bg-primary-50 text-primary-700'
            : 'text-neutral-700 hover:bg-neutral-50'
        }`

    return (
        <div className="relative" ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={triggerClasses}
            >
                {displayValue}
            </button>

            {/* Left Icon */}
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {icon}
                </div>
            )}

            {/* Dropdown Arrow */}
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${isOpen
                            ? `rotate-180 ${isDark ? 'text-primary-400' : 'text-primary-600'}`
                            : isDark ? 'text-neutral-400' : 'text-neutral-400'
                        }`}
                />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={dropdownClasses}>
                    <div className="max-h-60 overflow-y-auto py-1">
                        {normalizedOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={optionClasses(value === option.value)}
                            >
                                <span>{option.label}</span>
                                {value === option.value && (
                                    <Check size={16} className={isDark ? 'text-primary-400' : 'text-primary-600'} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

