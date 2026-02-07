'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

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

    // Compact Mode (Custom CSS classes)
    if (compact) {
        return (
            <div className="compact-uploader">
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="compact-preview" />
                        <div className="compact-overlay">
                            <label className="compact-change-btn">
                                {uploading ? 'Thinking...' : 'Change'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    disabled={uploading}
                                    className="hidden" // Keeping hidden as utility or style
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    </>
                ) : (
                    <label className="compact-uploader-label">
                        <span className="compact-uploader-icon">📸</span>
                        <span className="compact-uploader-text">
                            {uploading ? 'Uploading...' : label || 'Add Photo'}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            style={{ display: 'none' }}
                        />
                    </label>
                )}
            </div>
        )
    }

    // Standard Mode (Global CSS classes)
    return (
        <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
                {label}
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label className={`btn btn-secondary ${uploading ? 'opacity-50' : ''}`} style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
                    <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>

                {preview && (
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        border: '1px solid var(--gray-200)'
                    }}>
                        <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
            </div>
        </div>
    )
}
