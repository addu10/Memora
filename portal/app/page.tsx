'use client'

import Link from 'next/link'
import { useTheme } from './components/ThemeContext'

export default function HomePage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="logo">🧠 Memora</div>
        <nav className="nav-links">
          <button
            className="theme-toggle-btn-landing"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>
          <Link href="/login" className="btn btn-secondary">Login</Link>
          <Link href="/register" className="btn btn-primary">Get Started</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="hero">
        <div className="hero-badge">
          🏥 Clinical Evidence-Based Therapy Platform
        </div>
        <h1 className="hero-title">
          Restoring Connection<br />Through Memory
        </h1>
        <p className="hero-subtitle">
          A digital reminiscence therapy platform for early-stage Alzheimer&apos;s patients
          in Kerala. Powered by AI for face recognition and personalized therapy prompts.
        </p>
        <div className="hero-buttons">
          <Link href="/register" className="btn btn-primary btn-lg">
            Start Free Trial
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Caregiver Login
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">👤</div>
          <h3 className="feature-title">Face Recognition</h3>
          <p className="feature-desc">
            Help patients recognize family members with AI-powered face identification
            using just 5-10 photos per person.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💬</div>
          <h3 className="feature-title">Smart Prompts</h3>
          <p className="feature-desc">
            AI-generated contextual questions based on photo metadata,
            designed for Kerala&apos;s cultural context.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Progress Tracking</h3>
          <p className="feature-desc">
            Monitor patient&apos;s cognitive progress with detailed session analytics
            and memory recall scores.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3 className="feature-title">Privacy First</h3>
          <p className="feature-desc">
            All AI processing happens on-device. Patient data never leaves
            the phone without consent.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">4.86%</div>
            <div className="stat-text">Kerala 65+ with dementia</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">0.76-0.91</div>
            <div className="stat-text">Therapy effect size</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">94%</div>
            <div className="stat-text">Recognition accuracy</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Memora - Digital Reminiscence Therapy for Alzheimer&apos;s Patients</p>
        <p>Built with ❤️ for Kerala&apos;s elderly community</p>
      </footer>
    </div>
  )
}
