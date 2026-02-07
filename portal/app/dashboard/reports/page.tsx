'use client'

// Reports Page with Working Export
import { useState } from 'react'
import Link from 'next/link'

export default function ReportsPage() {
    const [loading, setLoading] = useState<string | null>(null)

    const handleExport = async (type: string, format: string) => {
        setLoading(`${type}-${format}`)
        try {
            const response = await fetch(`/api/reports/export?type=${type}&format=${format}`)

            if (format === 'csv') {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(url)
            } else {
                const data = await response.json()
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(a)
                a.click()
                a.remove()
                window.URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error('Export failed:', error)
            alert('Export failed. Please try again.')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Export</h1>
                    <p className="page-subtitle">Download therapy data for analysis</p>
                </div>
            </div>

            <div className="reports-grid">
                {/* Sessions Report */}
                <div className="report-card">
                    <div className="stat-icon-3d">
                        <img src="/icons/sessions.png" alt="" className="stat-icon-img" />
                    </div>
                    <h3 className="report-title">Session History</h3>
                    <p className="report-desc">
                        Export all therapy sessions with duration, mood, and recall scores
                    </p>
                    <div className="report-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => handleExport('sessions', 'csv')}
                            disabled={loading === 'sessions-csv'}
                        >
                            {loading === 'sessions-csv' ? 'Exporting...' : 'Export CSV'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleExport('sessions', 'json')}
                            disabled={loading === 'sessions-json'}
                        >
                            {loading === 'sessions-json' ? 'Exporting...' : 'Export JSON'}
                        </button>
                    </div>
                </div>

                {/* Memories Report */}
                <div className="report-card">
                    <div className="stat-icon-3d">
                        <img src="/icons/memories.png" alt="" className="stat-icon-img" />
                    </div>
                    <h3 className="report-title">Memory Catalog</h3>
                    <p className="report-desc">
                        Export all memories with dates, events, locations, and people
                    </p>
                    <div className="report-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => handleExport('memories', 'csv')}
                            disabled={loading === 'memories-csv'}
                        >
                            {loading === 'memories-csv' ? 'Exporting...' : 'Export CSV'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleExport('memories', 'json')}
                            disabled={loading === 'memories-json'}
                        >
                            {loading === 'memories-json' ? 'Exporting...' : 'Export JSON'}
                        </button>
                    </div>
                </div>

                {/* Progress Report */}
                <div className="report-card">
                    <div className="stat-icon-3d">
                        <img src="/icons/analytics.png" alt="" className="stat-icon-img" />
                    </div>
                    <h3 className="report-title">Progress Summary</h3>
                    <p className="report-desc">
                        Comprehensive progress report with trends and statistics
                    </p>
                    <div className="report-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => handleExport('progress', 'csv')}
                            disabled={loading === 'progress-csv'}
                        >
                            {loading === 'progress-csv' ? 'Exporting...' : 'Export CSV'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleExport('progress', 'json')}
                            disabled={loading === 'progress-json'}
                        >
                            {loading === 'progress-json' ? 'Exporting...' : 'Export JSON'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="info-card">
                <div className="info-icon" style={{ background: '#fefce8', padding: '10px', borderRadius: '50%' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#854d0e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                </div>
                <div className="info-content">
                    <h4 className="info-title">Secure Export</h4>
                    <p className="info-text">
                        Data is exported securely. CSV files are optimized for Excel, and JSON files for deep analysis.
                    </p>
                </div>
            </div>
        </div>
    )
}
