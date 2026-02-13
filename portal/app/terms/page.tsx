import Link from 'next/link'
import { FileText, ChevronLeft, Scale, CheckCircle2, AlertCircle, Info } from 'lucide-react'

export default function TermsPage() {
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
                            <Scale size={24} />
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-violet-50 text-violet-600 text-sm font-black uppercase tracking-widest border border-violet-100">
                            Agreement
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                        Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x">Service</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                        By using Memora, you agree to our terms. We’ve kept it simple because we believe in clear communication between us and our caregivers.
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    {[
                        {
                            title: 'Acceptance of Terms',
                            icon: <CheckCircle2 className="text-violet-500" />,
                            content: 'By accessing or using the Memora Portal and Mobile App, you signify your agreement to these Terms of Service. These terms apply to all caregivers and users of our platform.'
                        },
                        {
                            title: 'Clinical Disclaimer',
                            icon: <AlertCircle className="text-rose-500" />,
                            content: 'Memora is a tool for digital reminiscence therapy. It is NOT a replacement for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical guidance.'
                        },
                        {
                            title: 'User Responsibilities',
                            icon: <Info className="text-violet-500" />,
                            content: 'As a caregiver, you are responsible for maintaining the confidentiality of your login credentials and for all data uploaded to the patient profiles you manage.'
                        },
                        {
                            title: 'Service Limitations',
                            icon: <FileText className="text-violet-500" />,
                            content: 'While we strive for 100% uptime, Memora services are provided "as is". We reserve the right to modify or discontinue features to improve the therapy experience.'
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

                <div className="mt-16 text-center text-slate-400 font-medium pb-12">
                    Last Updated: February 13, 2026
                </div>
            </div>
        </div>
    )
}
