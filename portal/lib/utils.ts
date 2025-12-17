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
