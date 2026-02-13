import Link from 'next/link'
import { Shield, ChevronLeft, Lock, Eye, FileText, Globe, Brain } from 'lucide-react'

export default function PrivacyPage() {
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
                            <Shield size={24} />
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-violet-50 text-violet-600 text-sm font-black uppercase tracking-widest border border-violet-100">
                            Security & Trust
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                        Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x">Policy</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                        At Memora, we understand the sensitivity of the data you entrust us with. Your loved one's memories are personal, and we keep them that way.
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    {[
                        {
                            title: 'Data Collection',
                            icon: <Eye className="text-violet-500" />,
                            content: 'We only collect data necessary for providing our digital therapy services. This includes patient profiles, photographs for reminiscence, and session performance metrics recorded with caregiver consent.'
                        },
                        {
                            title: 'How We Use Data',
                            icon: <Brain className="text-violet-500" />,
                            content: 'Your data is used exclusively to personalize the therapy experience. We do not sell, trade, or share your personal information or patient memories with any third parties for marketing purposes.'
                        },
                        {
                            title: 'Storage & Security',
                            icon: <Lock className="text-violet-500" />,
                            content: 'All data is stored on encrypted servers. We use industry-standard security protocols to ensure that patient PINs, photos, and clinical notes remain accessible only to authorized caregivers.'
                        },
                        {
                            title: 'Your Rights',
                            icon: <FileText className="text-violet-500" />,
                            content: 'You have the right to access, modify, or permanently delete your data at any time. Our "Purge" feature allows you to erase all patient records instantly from our servers.'
                        }
                    ].map((section, i) => (
                        <div key={i} className="glass-card bg-white/60 p-8 rounded-[2.5rem] border border-white/50 shadow-xl shadow-slate-100 flex gap-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
                            <div className="w-14 h-14 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg border border-slate-50">
                                {section.icon}
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{section.title}</h3>
                                <p className="text-slate-600 font-medium leading-relaxed">{section.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="mt-20 p-8 bg-slate-900 rounded-[2.5rem] text-center text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity" />
                    <h4 className="text-xl font-bold mb-2">Have questions about your data?</h4>
                    <p className="text-slate-400 mb-6 px-4">Our dedicated support team is here to help clarify how we protect your information.</p>
                    <Link href="/support" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-2xl font-black hover:scale-105 transition-all">
                        Contact Support
                    </Link>
                </div>
            </div>
        </div>
    )
}
