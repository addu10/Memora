'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Load theme from localStorage or system preference
        const savedTheme = localStorage.getItem('memora-theme') as Theme
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

        const initialTheme = savedTheme || systemTheme
        setTheme(initialTheme)
        document.documentElement.setAttribute('data-theme', initialTheme)
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('memora-theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    // Prevent hydration mismatch by handling this in consumers if needed, 
    // or accepting the initial 'light' state. We MUST wrap in Provider always.

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
