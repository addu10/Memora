'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Image as ImageIcon, Plus, Calendar, Users, Star, ArrowRight } from 'lucide-react'

interface Memory {
    id: string
    title: string
    description: string | null
    photoUrls: string[] | null
    event: string
    date: string
    people: string
    importance: number
}

interface MemoryGalleryProps {
    memories: Memory[]
    patientName: string
}

export default function MemoryGallery({ memories, patientName }: MemoryGalleryProps) {
    const [activeFilter, setActiveFilter] = useState('All Memories')

    // Get unique events for filter chips
    const uniqueEvents = Array.from(new Set(memories.map(m => m.event))).filter(Boolean)

    // Filter memories based on active selection
    const filteredMemories = activeFilter === 'All Memories'
        ? memories
        : memories.filter(m => m.event === activeFilter)

    return (
        <div className="space-y-8">
            {/* Filters / Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide py-2">
                <button
                    onClick={() => setActiveFilter('All Memories')}
                    className={`flex-shrink-0 px-6 py-2.5 rounded-2xl font-bold transition-all hover:scale-105 ${activeFilter === 'All Memories'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white/60 hover:bg-white text-slate-600 border border-white/50 shadow-sm'
                        }`}
                >
                    All Memories
                </button>
                {uniqueEvents.map(event => (
                    <button
                        key={event}
                        onClick={() => setActiveFilter(event)}
                        className={`flex-shrink-0 px-6 py-2.5 rounded-2xl font-bold border backdrop-blur-sm transition-all hover:scale-105 ${activeFilter === event
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-600'
                            : 'bg-white/60 hover:bg-white text-slate-600 border-white/50 shadow-sm hover:text-indigo-600 hover:shadow-md'
                            }`}
                    >
                        {event}
                    </button>
                ))}
            </div>

            {/* Memories Grid or Empty State */}
            {filteredMemories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMemories.map((memory, index) => (
                        <Link
                            href={`/dashboard/memories/${memory.id}`}
                            key={memory.id}
                            className="group relative flex flex-col glass-card rounded-[2rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Image Container */}
                            <div className="relative h-64 w-full overflow-hidden bg-slate-100">
                                {memory.photoUrls && memory.photoUrls.length > 0 ? (
                                    <img
                                        src={memory.photoUrls[0]}
                                        alt={memory.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-indigo-50/50">
                                        <ImageIcon size={48} className="text-indigo-200/50" />
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                                {/* Floating Badge */}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 shadow-sm">
                                    {memory.event}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex gap-0.5">
                                        {[...Array(memory.importance || 0)].map((_, i) => (
                                            <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-auto">
                                        {new Date(memory.date).getFullYear()}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                    {memory.title}
                                </h3>

                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100/50">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                        <Users size={14} />
                                        <span className="truncate max-w-[120px]">{memory.people}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="relative rounded-[2.5rem] overflow-hidden bg-white/40 backdrop-blur-md border border-white/60 p-12 text-center shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-200/20 rounded-full blur-3xl -z-10"></div>

                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100/50 rotate-3 transition-transform hover:rotate-6">
                        <ImageIcon size={40} className="text-indigo-500" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">
                        {activeFilter === 'All Memories' ? 'Capture Your First Memory' : `No Memories for ${activeFilter}`}
                    </h2>
                    <p className="text-slate-500 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
                        {activeFilter === 'All Memories'
                            ? `"Building a bridge to the past starts with a single photo."`
                            : `You haven't created any memories for this event category yet.`}
                        <br />
                        {activeFilter === 'All Memories' && `Upload a photo to begin building ${patientName}'s gallery.`}
                    </p>

                    {activeFilter === 'All Memories' && (
                        <Link href="/dashboard/memories/new" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all hover:scale-105 hover:shadow-indigo-300">
                            <Plus size={24} /> Add First Memory
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
