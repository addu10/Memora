import Link from 'next/link'
import { HelpCircle, ChevronLeft, Mail, MessageSquare, Phone, BookOpen, Clock, Globe } from 'lucide-react'

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-[#FDFBFF] py-12 px-4 md:py-20 overflow-hidden relative">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-100/40 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10" />

            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 font-bold mb-12 transition-all p-2 -ml-2 rounded-xl hover:bg-violet-50">
                    <ChevronLeft size={20} />
                    <span>Back to Home</span>
                </Link>

                {/* Header */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 shadow-inner">
                            <HelpCircle size={24} />
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-violet-50 text-violet-600 text-sm font-black uppercase tracking-widest border border-violet-100">
                            Help Center
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                        We're here to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x">Support</span> you
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                        Caregiving is a journey, and you don't have to walk it alone. Our team is dedicated to making Memora a seamless part of your care routine.
                    </p>
                </div>

                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {[
                        {
                            title: 'Email Support',
                            icon: <Mail className="text-violet-600" />,
                            action: 'support@memora.ai',
                            description: 'Typical response time: 2-4 hours.'
                        },
                        {
                            title: 'Live Chat',
                            icon: <MessageSquare className="text-emerald-600" />,
                            action: 'Open Messenger',
                            description: 'Available Mon-Fri, 9AM to 6PM IST.'
                        },
                        {
                            title: 'Help Center',
                            icon: <BookOpen className="text-amber-600" />,
                            action: 'Browse Articles',
                            description: 'Step-by-step guides for everything.'
                        },
                        {
                            title: 'Regional Support',
                            icon: <Globe className="text-indigo-600" />,
                            action: '+91 484 220 0000',
                            description: 'Dedicated support for Kerala region.'
                        }
                    ].map((card, i) => (
                        <div key={i} className="glass-card bg-white/60 p-8 rounded-[2.5rem] border border-white/50 shadow-xl shadow-slate-100 animate-in fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md mb-6 border border-slate-50">
                                {card.icon}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">{card.title}</h3>
                            <p className="text-slate-500 font-medium mb-6">{card.description}</p>
                            <button className="w-full py-4 bg-slate-100 hover:bg-violet-600 hover:text-white rounded-2xl font-black text-slate-900 transition-all border border-slate-200 hover:border-violet-500">
                                {card.action}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ Style Note */}
                <div className="glass-card bg-violet-900 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600 rounded-full blur-[80px] opacity-30" />
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <h2 className="text-3xl font-black tracking-tight leading-tight">Need immediate technical walkthrough?</h2>
                        <p className="text-violet-200 font-medium opacity-80">Check our video setup guide for the mobile app and face recognition integration.</p>
                    </div>
                    <button className="px-8 py-4 bg-white text-violet-900 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all whitespace-nowrap">
                        Watch Setup
                    </button>
                </div>
            </div>
        </div>
    )
}
