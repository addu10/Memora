'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    primaryAction?: {
        label: string
        onClick: () => void
        variant?: 'primary' | 'danger'
        disabled?: boolean
    }
}

export default function Modal({ isOpen, onClose, title, children, primaryAction }: ModalProps) {
    const [mounted, setMounted] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isOpen) {
            document.body.style.overflow = 'hidden'
            // Small delay to trigger entrance animation
            const timer = setTimeout(() => setIsAnimating(true), 10)
            return () => clearTimeout(timer)
        } else {
            setIsAnimating(false)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!mounted || !isOpen) return null

    return createPortal(
        <div className={`modal-overlay ${isAnimating ? 'visible' : ''}`}>
            <div className={`modal-container ${isAnimating ? 'visible' : ''}`}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                <div className="modal-body">
                    {children}
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    {primaryAction && (
                        <button
                            onClick={primaryAction.onClick}
                            disabled={primaryAction.disabled}
                            className={`btn ${primaryAction.variant === 'danger' ? 'btn-danger' : 'btn-primary'} ${primaryAction.disabled ? 'disabled' : ''}`}
                        >
                            {primaryAction.label}
                        </button>
                    )}
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    padding: 20px;
                }

                .modal-overlay.visible {
                    opacity: 1;
                }

                .modal-container {
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    border-radius: 2rem;
                    width: 100%;
                    max-width: 500px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    transform: scale(0.9) translateY(30px);
                    opacity: 0;
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .modal-container.visible {
                    transform: scale(1) translateY(0);
                    opacity: 1;
                }

                .modal-header {
                    padding: 2rem 2rem 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid var(--gray-100);
                }

                .modal-header h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--gray-900);
                    margin: 0;
                }

                .close-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: none;
                    background: var(--gray-50);
                    color: var(--gray-400);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .close-btn:hover {
                    background: var(--gray-100);
                    color: var(--gray-900);
                    transform: rotate(90deg);
                }

                .modal-body {
                    padding: 2rem;
                    color: var(--gray-600);
                    font-size: 1.05rem;
                    line-height: 1.6;
                }

                .modal-footer {
                    padding: 1.5rem 2rem 2rem;
                    background: var(--gray-50);
                    border-top: 1px solid var(--gray-100);
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }

                .btn {
                    padding: 0.8rem 1.8rem;
                    border-radius: 1rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-secondary {
                    background: var(--gray-50);
                    color: var(--gray-500);
                    border: 1px solid var(--gray-200);
                    padding: 0.8rem 1.8rem;
                    border-radius: 1rem;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-secondary:hover {
                    background: var(--gray-50);
                    color: var(--gray-900);
                    border-color: var(--gray-300);
                }

                .btn-primary {
                    background: var(--purple-gradient);
                    color: white;
                    box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3);
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 20px -5px rgba(124, 58, 237, 0.4);
                }

                .btn-danger {
                    background: linear-gradient(135deg, var(--accent-500), var(--accent-600));
                    color: white;
                    box-shadow: 0 10px 15px -3px rgba(244, 63, 94, 0.3);
                }

                .btn-danger:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 20px -5px rgba(244, 63, 94, 0.4);
                }

                .btn.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none !important;
                    box-shadow: none !important;
                    filter: grayscale(1);
                }
            `}</style>
        </div>,
        document.body
    )
}
