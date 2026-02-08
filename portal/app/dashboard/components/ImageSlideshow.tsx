'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageSlideshowProps {
    images: string[]
    title: string
}

export default function ImageSlideshow({ images, title }: ImageSlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full min-h-[300px] bg-neutral-800 flex items-center justify-center text-neutral-500">
                No photos available
            </div>
        )
    }

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    return (
        <div className="relative w-full h-full group">
            {/* Main Image */}
            <img
                src={images[currentIndex]}
                alt={`${title} - Photo ${currentIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
            />

            {/* Navigation Arrows - Show when there's more than 1 image */}
            {images.length > 1 && (
                <>
                    {/* Left Arrow */}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-neutral-700 hover:text-neutral-900 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Previous photo"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-neutral-700 hover:text-neutral-900 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Next photo"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Photo Counter Badge */}
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(idx); }}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex
                                        ? 'bg-white scale-110'
                                        : 'bg-white/40 hover:bg-white/70'
                                    }`}
                                aria-label={`Go to photo ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

