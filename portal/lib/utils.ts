// Utility functions
import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export function formatRelativeDate(date: Date | string): string {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return formatDate(date)
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export function getMoodEmoji(mood: string): string {
    const moods: Record<string, string> = {
        happy: '😊',
        neutral: '😐',
        sad: '😢',
        confused: '😕'
    }
    return moods[mood] || '😐'
}

export function getRecallLabel(score: number): string {
    const labels: Record<number, string> = {
        1: 'No recall',
        2: 'Vague',
        3: 'Partial',
        4: 'Good',
        5: 'Excellent'
    }
    return labels[score] || 'Unknown'
}

// Kerala-specific event categories
export const EVENT_CATEGORIES = [
    'Onam', 'Vishu', 'Christmas', 'Eid', 'Wedding', 'Birthday',
    'Temple-Visit', 'Church-Visit', 'Family-Gathering', 'Festival',
    'Anniversary', 'Graduation', 'Travel', 'Daily-Life', 'Other'
]

export const LOCATION_CATEGORIES = [
    'Home', 'Temple', 'Church', 'Mosque', 'Beach', 'Hill-Station',
    'Market', 'Hospital', 'School', 'Restaurant', 'Park',
    'Relative-House', 'Other'
]

export const RELATIONSHIPS = [
    'Wife', 'Husband', 'Son', 'Daughter', 'Mother', 'Father',
    'Brother', 'Sister', 'Grandson', 'Granddaughter', 'Friend',
    'Cousin', 'Uncle', 'Aunt', 'Neighbor', 'Other'
]

// Utility to handle Enter key navigation in forms
export function handleEnterKeyNavigation(e: React.KeyboardEvent<HTMLFormElement>) {
    // Only intercept Enter key
    if (e.key !== 'Enter') return

    const target = e.target as HTMLElement

    // Let textareas handle their own Enter for newlines
    if (target.tagName === 'TEXTAREA') return

    // If focus is already on a submit button, let it proceed
    if (target.tagName === 'BUTTON' && (target as HTMLButtonElement).type === 'submit') return

    // Prevent default form submission
    e.preventDefault()

    const form = e.currentTarget

    // Find all focusable elements in the form
    const allFocusable = Array.from(
        form.querySelectorAll('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])')
    ) as HTMLElement[]

    // Filter focusable elements to focus on primary form fields and main actions
    const focusableElements = allFocusable.filter(el => {
        // Exclude "Remove" or "X" buttons typically found in grids/lists
        if (el.tagName === 'BUTTON') {
            const btn = el as HTMLButtonElement
            if (btn.type === 'button') {
                const text = btn.innerText.toLowerCase()
                const ariaLabel = btn.getAttribute('aria-label')?.toLowerCase() || ''
                if (text === 'x' || text.includes('remove') || ariaLabel.includes('remove') || ariaLabel === 'close') {
                    return false
                }
            }
        }
        return true
    })

    const index = focusableElements.indexOf(target)

    // Jump to next element if it exists
    if (index > -1 && index < focusableElements.length - 1) {
        const nextElement = focusableElements[index + 1]
        nextElement.focus()

        // If it's a text input, select the text for easier editing
        if (nextElement instanceof HTMLInputElement && (nextElement.type === 'text' || nextElement.type === 'number')) {
            nextElement.select()
        }
    }
}
