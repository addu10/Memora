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
                    <div className="report-icon">📅</div>
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
                            {loading === 'sessions-csv' ? 'Exporting...' : '📊 CSV'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleExport('sessions', 'json')}
                            disabled={loading === 'sessions-json'}
                        >
                            {loading === 'sessions-json' ? 'Exporting...' : '{ } JSON'}
                        </button>
                    </div>
                </div>

                {/* Memories Report */}
                <div className="report-card">
                    <div className="report-icon">🖼️</div>
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
                            {loading === 'memories-csv' ? 'Exporting...' : '📊 CSV'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleExport('memories', 'json')}
                            disabled={loading === 'memories-json'}
                        >
                            {loading === 'memories-json' ? 'Exporting...' : '{ } JSON'}
                        </button>
                    </div>
                </div>

                {/* Progress Report */}
                <div className="report-card">
                    <div className="report-icon">📈</div>
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
                            {loading === 'progress-csv' ? 'Exporting...' : '📊 CSV'}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleExport('progress', 'json')}
                            disabled={loading === 'progress-json'}
                        >
                            {loading === 'progress-json' ? 'Exporting...' : '{ } JSON'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="info-card">
                <div className="info-icon">💡</div>
                <div className="info-content">
                    <h4 className="info-title">About Reports</h4>
                    <p className="info-text">
                        CSV files can be opened in Excel or Google Sheets for analysis.
                        JSON files are useful for data import into other applications.
                    </p>
                </div>
            </div>
        </div>
    )
}
