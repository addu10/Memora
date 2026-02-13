'use client'

import Link from 'next/link'
import { ArrowRight, Brain, Shield, Sparkles, Activity, Heart, Users, Play, Menu } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden selection:bg-indigo-500 selection:text-white font-sans text-slate-900">

      {/* Dynamic Light Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse duration-[8s] mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-rose-200/40 rounded-full blur-[120px] animate-pulse duration-[10s] mix-blend-multiply"></div>
        <div className="absolute top-[40%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-purple-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>

        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
      </div>

      {/* Unique Floating Navigation (Polished Glass Pill) */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="relative group rounded-full p-[1px] bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-rose-500/30 shadow-lg shadow-indigo-500/10">
          <header className="relative bg-white/90 backdrop-blur-2xl rounded-full px-3 py-2 flex items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 pl-4 hover:opacity-80 transition-opacity">
              <div className="h-9">
                <img src="/images/logo-full.jpg" alt="Memora" className="h-full w-auto object-contain mix-blend-multiply" />
              </div>
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-1 pr-1">
              <Link href="/login" className="px-5 py-2 rounded-full font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all text-sm">
                Login
              </Link>
              <Link href="/register" className="px-6 py-2 rounded-full font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all text-sm">
                Get Started
              </Link>
            </div>
          </header>
        </div>
      </div>

      <main className="relative z-10 pt-48 pb-20">

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-6 text-center mb-32 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm">
            <Sparkles size={14} className="fill-indigo-600" />
            <span>Clinical Evidence-Based Therapy</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 mb-8 leading-[1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
            Restoring <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500 animate-gradient-x">Connection.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            A digital reminiscence therapy platform for early-stage Alzheimer's patients. Powered by AI for personalized care.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in fade-in zoom-in duration-1000 delay-300">
            <Link href="/register" className="relative w-full sm:w-auto group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:to-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3 text-lg leading-none">
                <span>Experience Memora</span>
                <Play size={16} fill="currentColor" className="opacity-90" />
              </div>
            </Link>

            <Link href="/login" className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-slate-600 bg-white/50 backdrop-blur-md border border-white/60 hover:bg-white hover:text-indigo-600 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all text-lg leading-none group flex items-center justify-center gap-2">
              <span>Caregiver Login</span>
              <ArrowRight size={18} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
            </Link>
          </div>
        </section>

        {/* Stats Grid - Balanced & Glass Style */}
        <section className="max-w-6xl mx-auto px-6 mb-32 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-2">Why It Matters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stat 1: The Problem */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-lg shadow-indigo-100/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={120} className="text-rose-500" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
                    <Activity size={24} />
                  </div>
                  <span className="text-rose-600 font-bold text-sm uppercase tracking-wider">The Challenge</span>
                </div>
                <div className="text-6xl font-black text-slate-900 mb-2">4.86%</div>
                <div className="text-slate-500 font-medium text-lg max-w-xs">Older adults in Kerala are affected by dementia.</div>
              </div>
            </div>

            {/* Stat 2: The Solution */}
            <div className="group relative bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-lg shadow-indigo-100/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield size={120} className="text-emerald-500" />
              </div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
                    <Shield size={24} />
                  </div>
                  <span className="text-emerald-600 font-bold text-sm uppercase tracking-wider">Our Solution</span>
                </div>

                <div>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-6xl font-black text-slate-900">94%</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center gap-1">
                      Accuracy
                    </span>
                  </div>
                  <p className="text-slate-500 text-lg max-w-sm">Face Recognition accuracy on as few as 5 updated photos.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Staggered Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Therapy Reimagined</h2>
            <p className="text-slate-500 max-w-xl mx-auto text-lg">Advanced technology meets compassionate care in a seamless interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Feature 1: Face Recognition (Large, Dark Theme) */}
            <div className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-[#1e1b4b] p-10 text-white shadow-2xl transition-transform duration-500 hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl transition-all duration-700 group-hover:bg-indigo-500/30"></div>
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl text-indigo-300 shadow-inner backdrop-blur-md">
                    <Users size={32} />
                  </div>
                  <h3 className="mb-4 text-3xl font-bold">Face Recognition</h3>
                  <p className="max-w-md text-lg leading-relaxed text-indigo-100/80">
                    Instantly identifies family members in photos to help trigger memory recall and rebuild emotional connections.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-indigo-300">
                  <span>Powered by AI</span>
                  <div className="h-px w-12 bg-indigo-300/30"></div>
                </div>
              </div>
            </div>

            {/* Feature 2: Smart Prompts (Compact, Vertical) */}
            <div className="md:col-span-4 group relative overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-xl shadow-slate-200/50 transition-transform duration-500 hover:-translate-y-1 hover:shadow-2xl border border-slate-100">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="relative z-10">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-3xl text-purple-600 shadow-sm transition-transform duration-500 group-hover:rotate-6">
                  <Brain size={32} />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-slate-900">Smart Prompts</h3>
                <p className="text-slate-500 leading-relaxed">
                  AI generates culturally relevant conversation openers based on the context of every photo.
                </p>
              </div>
            </div>

            {/* Feature 3: Progress Tracking (Compact, Vertical) */}
            <div className="md:col-span-4 group relative overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-xl shadow-slate-200/50 transition-transform duration-500 hover:-translate-y-1 hover:shadow-2xl border border-slate-100">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="relative z-10">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-3xl text-emerald-600 shadow-sm transition-transform duration-500 group-hover:-rotate-3">
                  <Activity size={32} />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-slate-900">Progress Tracking</h3>
                <p className="text-slate-500 leading-relaxed">
                  Visualize cognitive engagement trends and mood patterns with simple, easy-to-read charts.
                </p>
              </div>
            </div>

            {/* Feature 4: Privacy First (Large, Light Accent Theme) */}
            <div className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-xl shadow-slate-200/50 transition-transform duration-500 hover:-translate-y-1 hover:shadow-2xl border border-slate-100">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-rose-50/80 to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-3xl text-rose-600 shadow-sm transition-transform duration-500 group-hover:rotate-3">
                    <Shield size={32} />
                  </div>
                  <h3 className="mb-4 text-3xl font-bold text-slate-900">Privacy First Design</h3>
                  <p className="text-lg leading-relaxed text-slate-500">
                    Your data never leaves your device without permission. All sensible processing happens locally, ensuring your memories remain yours alone.
                  </p>
                </div>
                {/* Decorative Lock Icon/Illustration */}
                <div className="hidden md:flex h-32 w-32 items-center justify-center rounded-full bg-rose-50/50 text-rose-200">
                  <Shield size={64} className="opacity-50" />
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      {/* Footer - Minimal & Focused */}
      <footer className="relative z-10 bg-[#0f172a] text-white py-12 overflow-hidden border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">

          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            {/*
                    Using CSS filters to make the JPG logo work on dark background:
                    1. grayscale: removes color (including potential yellow patterns)
                    2. invert: turns white background to black, dark text to white
                    3. mix-blend-screen: hides the black background, leaving white text
                */}
            <img
              src="/images/logo-full.jpg"
              alt="Memora"
              className="h-16 w-auto object-contain grayscale invert mix-blend-screen opacity-90"
            />
          </div>

          {/* Mission Statement */}
          <p className="text-slate-400 max-w-lg mx-auto mb-8 font-medium text-lg">
            Restoring connection through digital reminiscence therapy.<br />
            <span className="text-slate-500 text-sm">Built with ❤️ for Kerala's elderly community.</span>
          </p>

          {/* Essential Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 font-medium mb-8">
            <div className="flex gap-8 order-1 md:order-2">
              <Link href="/privacy" className="text-slate-400 hover:text-violet-600 transition-colors font-medium">Privacy</Link>
              <Link href="/terms" className="text-slate-400 hover:text-violet-600 transition-colors font-medium">Terms</Link>
              <Link href="/support" className="text-slate-400 hover:text-violet-600 transition-colors font-medium">Support</Link>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-slate-600 text-xs">
            © {new Date().getFullYear()} Memora. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
