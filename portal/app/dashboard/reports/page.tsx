'use client'

// Reports Page with Working Export
import { useState } from 'react'
import { FileText, Download, Database, BarChart3, ShieldCheck, FileJson, FileSpreadsheet } from 'lucide-react'

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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900">Reports & Export</h1>
                    <p className="text-neutral-500 mt-2 text-lg">Download comprehensive therapy data for analysis and record-keeping.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Sessions Report */}
                <div className="group bg-white rounded-[2.5rem] p-8 shadow-sm-soft border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Session History</h3>
                    <p className="text-neutral-500 mb-8 leading-relaxed h-12">
                        Export all therapy sessions with duration, mood, and recall scores.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={() => handleExport('sessions', 'csv')}
                            disabled={loading === 'sessions-csv'}
                        >
                            {loading === 'sessions-csv' ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet size={18} />
                                    <span>Export CSV</span>
                                </>
                            )}
                        </button>
                        <button
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={() => handleExport('sessions', 'json')}
                            disabled={loading === 'sessions-json'}
                        >
                            {loading === 'sessions-json' ? 'Exporting...' : (
                                <>
                                    <FileJson size={18} />
                                    <span>Export JSON</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Memories Report */}
                <div className="group bg-white rounded-[2.5rem] p-8 shadow-sm-soft border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                        <Database size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Memory Catalog</h3>
                    <p className="text-neutral-500 mb-8 leading-relaxed h-12">
                        Export all memories with dates, events, locations, and tagged people.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={() => handleExport('memories', 'csv')}
                            disabled={loading === 'memories-csv'}
                        >
                            {loading === 'memories-csv' ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet size={18} />
                                    <span>Export CSV</span>
                                </>
                            )}
                        </button>
                        <button
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={() => handleExport('memories', 'json')}
                            disabled={loading === 'memories-json'}
                        >
                            {loading === 'memories-json' ? 'Exporting...' : (
                                <>
                                    <FileJson size={18} />
                                    <span>Export JSON</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Progress Report */}
                <div className="group bg-white rounded-[2.5rem] p-8 shadow-sm-soft border border-neutral-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">Progress Summary</h3>
                    <p className="text-neutral-500 mb-8 leading-relaxed h-12">
                        Comprehensive progress report with trends, statistics, and improvement metrics.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={() => handleExport('progress', 'csv')}
                            disabled={loading === 'progress-csv'}
                        >
                            {loading === 'progress-csv' ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet size={18} />
                                    <span>Export CSV</span>
                                </>
                            )}
                        </button>
                        <button
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            onClick={() => handleExport('progress', 'json')}
                            disabled={loading === 'progress-json'}
                        >
                            {loading === 'progress-json' ? 'Exporting...' : (
                                <>
                                    <FileJson size={18} />
                                    <span>Export JSON</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-amber-50 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 border border-amber-100">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <ShieldCheck size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-amber-900 mb-1">Secure Data Export</h4>
                    <p className="text-amber-800/80">
                        Data is exported securely and locally. CSV files are optimized for Excel, and JSON files are structured for deep analysis or system backups.
                    </p>
                </div>
            </div>
        </div>
    )
}
