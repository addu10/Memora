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
            <Link href="/register" className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 text-lg group">
              <span>Start Free Trial</span>
              <div className="bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors">
                <Play size={16} fill="currentColor" className="ml-0.5" />
              </div>
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-lg shadow-indigo-100/50 hover:shadow-xl hover:-translate-y-1 border border-indigo-100/50 text-lg">
              Caregiver Login
            </Link>
          </div>
        </section>

        {/* Stats Grid - Floating Glass Style */}
        <section className="max-w-6xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-lg shadow-indigo-100/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
              <div className="relative z-10">
                <div className="text-6xl font-black text-slate-900 mb-2">4.86%</div>
                <div className="text-slate-500 font-medium text-lg">Kerala 65+ with dementia</div>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-tl-[2.5rem] rounded-br-[2.5rem] -z-10 group-hover:scale-150 transition-transform duration-700 origin-bottom-right"></div>
            </div>

            <div className="group relative bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/60 shadow-lg shadow-indigo-100/50 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 md:col-span-2 overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-7xl font-black text-slate-900">94%</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center gap-1">
                      <Activity size={14} /> Accuracy
                    </span>
                  </div>
                  <p className="text-slate-500 text-lg">Face Recognition Accuracy on as few as 5 photos.</p>
                </div>
                <div className="w-full md:w-auto bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md"></div>
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-32 bg-slate-100 rounded-full"></div>
                      <div className="h-2.5 w-20 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full mb-2 overflow-hidden">
                    <div className="h-full w-[94%] bg-emerald-500 rounded-full animate-[progress_1.5s_ease-out]"></div>
                  </div>
                  <div className="text-xs text-slate-400 text-right font-medium">High Confidence Match</div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-200/40 transition-all duration-300 hover:-translate-y-2 border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 text-3xl shadow-sm rotate-3 group-hover:rotate-6 transition-transform">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Face Recognition</h3>
              <p className="text-slate-500 leading-relaxed">
                Instantly identifies family members to help trigger memory recall and emotional connection.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-purple-200/40 transition-all duration-300 hover:-translate-y-2 border border-slate-100 lg:mt-12">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 text-3xl shadow-sm -rotate-2 group-hover:-rotate-6 transition-transform">
                <Brain size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Prompts</h3>
              <p className="text-slate-500 leading-relaxed">
                AI generates culturally relevant conversation starters based on photo context and history.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-emerald-200/40 transition-all duration-300 hover:-translate-y-2 border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 text-3xl shadow-sm rotate-1 group-hover:rotate-3 transition-transform">
                <Activity size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Progress Tracking</h3>
              <p className="text-slate-500 leading-relaxed">
                Visualize cognitive engagement and mood patterns over time with detailed analytics.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-rose-200/40 transition-all duration-300 hover:-translate-y-2 border border-slate-100 lg:mt-12">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 text-3xl shadow-sm -rotate-3 group-hover:-rotate-6 transition-transform">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Privacy First</h3>
              <p className="text-slate-500 leading-relaxed">
                All sensitive data is processed locally on-device. Your memories remain yours, always.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 py-12 bg-white/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-8 opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Memora</span>
          </div>

          <p className="text-slate-500 font-medium mb-6 text-sm">© 2025 Memora - Restoring connection through digital reminiscence.</p>

          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-400 text-xs font-bold shadow-sm">
            <span>Built with</span>
            <Heart size={12} className="text-rose-500 fill-current animate-pulse" />
            <span>for Kerala's elderly community</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
