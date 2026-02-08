'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react'

interface ImageUploadProps {
    onUpload: (url: string) => void
    bucket: 'memories' | 'family-photos'
    label?: string
    compact?: boolean
    currentUrl?: string
}

export default function ImageUpload({ onUpload, bucket, label = 'Upload Image', compact = false, currentUrl }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(currentUrl || null)

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]

            // File size validation (5MB limit)
            const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
            if (file.size > MAX_FILE_SIZE) {
                throw new Error('Image must be less than 5MB')
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

            setPreview(data.publicUrl)
            onUpload(data.publicUrl)
        } catch (error) {
            alert('Error uploading image!')
            console.log(error)
        } finally {
            setUploading(false)
        }
    }

    // Compact Mode (Used in Grids)
    if (compact) {
        return (
            <div className="w-full h-full relative group cursor-pointer">
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <label className="cursor-pointer px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-bold border border-white/30 hover:bg-white/30 transition-all flex items-center gap-2">
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                                <span>Change</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </label>
                        </div>
                    </>
                ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-slate-400 group-hover:text-violet-600 transition-colors gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                            {uploading ? <Loader2 size={20} className="animate-spin text-violet-600" /> : <Camera size={20} />}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider">
                            {uploading ? 'Uploading...' : label || 'Add Photo'}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                            title={uploading ? 'Uploading...' : 'Upload photo'}
                        />
                    </label>
                )}
            </div>
        )
    }

    // Standard Mode (Used in forms)
    return (
        <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">
                {label}
            </label>

            <div className="flex items-center gap-4">
                <label className={`
                    flex items-center gap-2 px-5 py-3 rounded-xl font-bold cursor-pointer transition-all border
                    ${uploading
                        ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50/50 shadow-sm'
                    }
                `}>
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                    <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>

                {preview && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>
        </div>
    )
}
