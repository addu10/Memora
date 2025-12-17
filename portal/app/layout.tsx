// Root layout for Memora Portal
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Memora - Caregiver Portal',
    description: 'Digital reminiscence therapy platform for Alzheimer\'s patients. Manage patients, memories, and therapy sessions.',
    keywords: ['Alzheimer', 'dementia', 'therapy', 'caregiver', 'memory', 'Kerala'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                {children}
            </body>
        </html>
    )
}
