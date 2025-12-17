'use client'

import { useState } from 'react'

interface ImageSlideshowProps {
    images: string[]
    title: string
}

export default function ImageSlideshow({ images, title }: ImageSlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
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

        <div className="slideshow-container">
            <img
                src={images[currentIndex]}
                alt={`${title} - Photo ${currentIndex + 1}`}
                className="slide-image"
            />

            {/* Navigation Overlay */}
            {images.length > 1 && (
                <>
                    <div className="slideshow-nav">
                        <button
                            onClick={(e) => { e.preventDefault(); prevSlide(); }}
                            className="nav-btn"
                        >
                            ←
                        </button>
                        <button
                            onClick={(e) => { e.preventDefault(); nextSlide(); }}
                            className="nav-btn"
                        >
                            →
                        </button>
                    </div>

                    {/* Dots / Counter */}
                    <div className="slideshow-dots">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`dot ${idx === currentIndex ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
