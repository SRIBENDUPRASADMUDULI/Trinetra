'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldCheck, PhoneCall, ArrowRight, MessageSquare, FileText, Bot,
  GraduationCap, Code2, Microscope, KeyRound, Radar, Scale, Video,
  ScanFace, BookOpen, AlertTriangle, CheckCircle2, Search, ExternalLink,
  Lock, Eye, AlertOctagon, HelpCircle, Sparkles, Building2, User
} from 'lucide-react'
import { useLang } from '@/lib/i18n-context'

interface SafetyTool {
  id: string
  name: string
  hiName: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  category: 'citizen' | 'enterprise' | 'both'
  badge: string
  summaryEn: string
  summaryHi: string
  whenToUseEn: string
  whenToUseHi: string
}

const COMPREHENSIVE_TOOLS: SafetyTool[] = [
  {
    id: 'nlp',
    name: 'Message & Link Scam Checker',
    hiName: 'संदेश और लिंक जांचें (Scam Checker)',
    href: '/nlp',
    icon: MessageSquare,
    color: 'from-emerald-500 to-teal-600',
    category: 'both',
    badge: '90+ Antivirus Engines',
    summaryEn: 'Paste any suspicious SMS, WhatsApp forward, or website link to check if it is a fraud, phishing trap, or bank scam.',
    summaryHi: 'कोई भी संदिग्ध SMS, WhatsApp मैसेज या लिंक पेस्ट करें और 90+ एंटीवायरस इंजनों से जांचें कि यह सुरक्षित है या बैंक फ्रॉड।',
    whenToUseEn: 'Use when you get messages like "Bank KYC expired", "Electricity bill unpaid", or "Win ₹50,000 lottery".',
    whenToUseHi: 'जब बैंक KYC बंद होने, बिजली बिल कटने या लॉटरी जीतने का कोई भी अनजान मैसेज या लिंक आए।',
  },
  {
    id: 'deepfake',
    name: 'Deepfake Photo & Video Verifier',
    hiName: 'नकली वीडियो और फोटो जांचें (Deepfake Lab)',
    href: '/deepfake-xai',
    icon: ScanFace,
    color: 'from-indigo-500 to-purple-600',
    category: 'both',
    badge: 'AI Vision Transformer',
    summaryEn: 'Scan photos and video clips to check if a face or voice was generated using artificial intelligence (AI) or altered.',
    summaryHi: 'फोटो या वीडियो अपलोड करके जांचें कि क्या चेहरा AI से बदला गया है या असली कैमरा फोटो है।',
    whenToUseEn: 'Use when you see suspicious viral videos, altered matrimonial photos, or video calls asking for emergency UPI money.',
    whenToUseHi: 'जब कोई संदिग्ध वीडियो कॉल, वायरल क्लिप या अनजान शादी/नौकरी की फोटो देखकर शक हो।',
  },
  {
    id: 'exif',
    name: 'Photo Privacy & GPS Location Remover',
    hiName: 'फोटो से गुप्त लोकेशन और डेटा हटाएं (EXIF Clean)',
    href: '/exif',
    icon: Microscope,
    color: 'from-teal-500 to-emerald-600',
    category: 'citizen',
    badge: '100% Zero-Trust Privacy',
    summaryEn: 'Your mobile photos contain hidden home GPS coordinates and camera serials. Strip them with 1 click before sharing online.',
    summaryHi: 'मोबाइल फोटो में आपके घर की सही GPS लोकेशन और फोन का सीरियल नंबर छिपा होता है। इंटरनेट पर भेजने से पहले इसे हटाएं।',
    whenToUseEn: 'Use before posting photos of your children, home, or family on social media, OLX, or public forums.',
    whenToUseHi: 'सोशल मीडिया, OLX या इंटरनेट पर घर या बच्चों की फोटो अपलोड करने से पहले सुरक्षा के लिए।',
  },
  {
    id: 'incident',
    name: 'File Cyber Crime Complaint / e-FIR',
    hiName: 'पुलिस शिकायत / e-FIR पत्र बनाएं',
    href: '/incident',
    icon: AlertOctagon,
    color: 'from-amber-500 to-orange-600',
    category: 'both',
    badge: 'BNS 2023 · Legal Ready',
    summaryEn: 'Generate an official, legally structured cyber crime complaint letter for police and banks under Indian BNS laws.',
    summaryHi: 'ऑनलाइन ठगी या पैसे कटने पर पुलिस थाने और बैंक में जमा करने के लिए कानूनी e-FIR पत्र 2 मिनट में तैयार करें।',
    whenToUseEn: 'Use immediately if money was stolen from your bank, UPI fraud happened, or someone is blackmailing you online.',
    whenToUseHi: 'जब बैंक से धोखे से पैसे कट जाएं, फर्जी पुलिस डिजिटल अरेस्ट की धमकी दे या कोई ब्लैकमेल करे।',
  },
  {
    id: 'breach',
    name: 'Data Leak & Password Exposure Check',
    hiName: 'डेटा लीक और पासवर्ड जांच (Leak Check)',
    href: '/breach',
    icon: KeyRound,
    color: 'from-rose-500 to-pink-600',
    category: 'citizen',
    badge: 'k-Anonymity Secured',
    summaryEn: 'Check if your email or password has been stolen in historical internet data leaks — verified safely without revealing passwords.',
    summaryHi: 'बिना अपना पासवर्ड किसी को बताए, चेक करें कि क्या आपका ईमेल या पासवर्ड इंटरनेट पर किसी पुरानी हैकिंग में लीक हुआ है।',
    whenToUseEn: 'Use to audit your primary personal email, social media login passwords, and family accounts.',
    whenToUseHi: 'यह जानने के लिए कि आपका पुराना पासवर्ड सुरक्षित है या तुरंत बदलने की जरूरत है।',
  },
  {
    id: 'mentor',
    name: '24/7 AI Cyber Safety Advisor',
    hiName: '24/7 एआई साइबर सुरक्षा सहायक (AI Assistant)',
    href: '/mentor',
    icon: Bot,
    color: 'from-sky-500 to-blue-600',
    category: 'citizen',
    badge: 'Sovereign Indic AI',
    summaryEn: 'Ask any cybersecurity question in plain Hindi or English and get instant, trusted step-by-step guidance from sovereign AI.',
    summaryHi: 'साइबर सुरक्षा से जुड़ा कोई भी सवाल आसान हिंदी या इंग्लिश में पूछें और तुरंत सुरक्षित समाधान पाएं।',
    whenToUseEn: 'Use when you are confused about an unknown phone call, suspicious email, or unfamiliar phone setting.',
    whenToUseHi: 'जब किसी अनजान कॉल, संदिग्ध UPI मैसेज या मोबाइल की सेटिंग के बारे में तुरंत सलाह चाहिए हो।',
  },
  {
    id: 'intel',
    name: 'God\'s Eye 3D Earth Threat Globe',
    hiName: 'गॉड्स आई 3D अर्थ थ्रेट ग्लोब (God\'s Eye)',
    href: '/intel',
    icon: Radar,
    color: 'from-cyan-500 to-blue-600',
    category: 'enterprise',
    badge: 'Live Flights, Ships & Orbits',
    summaryEn: 'Interactive 3D Earth showing live commercial aircraft, ships, CelesTrak satellites, earthquakes, and active cyber attacks.',
    summaryHi: '3D पृथ्वी पर लाइव हवाई जहाज (flights), समुद्री जहाज (ships), सैटेलाइट्स, भूकंप और साइबर हमलों को रियल-टाइम में देखें।',
    whenToUseEn: 'Use to understand global and national cyber attacks, critical infrastructure defense, and live aerospace OSINT.',
    whenToUseHi: 'देश की राष्ट्रीय साइबर सुरक्षा, सबमरीन केबल्स और अंतरिक्ष संपत्तियों पर नजर रखने के लिए।',
  },
  {
    id: 'cyber-ir',
    name: 'Emergency Cyber Incident Response',
    hiName: 'आपातकालीन साइबर रिस्पांस गाइड (IR Playbooks)',
    href: '/cyber-ir',
    icon: Scale,
    color: 'from-red-500 to-rose-600',
    category: 'enterprise',
    badge: 'SANS PICERL · CERT-In',
    summaryEn: 'Step-by-step emergency playbooks on what to do in the first 60 minutes of a ransomware attack, server breach, or hack.',
    summaryHi: 'ऑफिस सिस्टम हैक होने, रैंसमवेयर आने या कंपनी का डेटा चोरी होने पर पहले 60 मिनट में क्या कदम उठाने चाहिए।',
    whenToUseEn: 'Use when your company or personal computer is locked by ransomware, accounts are hijacked, or files are compromised.',
    whenToUseHi: 'जब कंप्यूटर पर स्क्रीन लॉक हो जाए, फाइलें इनक्रिप्ट हो जाएं या ऑफिस का नेटवर्क हैक हो जाए।',
  },
  {
    id: 'academy',
    name: 'Cyber Awareness Academy & Quizzes',
    hiName: 'साइबर सुरक्षा सीखें और क्विज़ खेलें (Academy)',
    href: '/academy',
    icon: GraduationCap,
    color: 'from-violet-500 to-purple-600',
    category: 'citizen',
    badge: 'Free Interactive Games',
    summaryEn: 'Simple interactive lessons and spot-the-scam challenges designed for families, school students, and office staff.',
    summaryHi: 'परिवार के सदस्यों, छात्रों और बड़ों के लिए आसान पाठ और क्विज़ जिससे वो ऑनलाइन फ्रॉड तुरंत पहचान सकें।',
    whenToUseEn: 'Use to educate elderly parents, children, and friends on how to avoid digital arrest and UPI scams.',
    whenToUseHi: 'बच्चों और माता-पिता को इंटरनेट के खतरों से आगाह करने और अभ्यास कराने के लिए।',
  },
  {
    id: 'devsec',
    name: 'Secure Code & Vulnerability Scanner',
    hiName: 'सुरक्षित कोड और कमियां स्कैनर (Code Scanner)',
    href: '/devsec',
    icon: Code2,
    color: 'from-slate-600 to-zinc-800',
    category: 'enterprise',
    badge: 'Developers & IT Teams',
    summaryEn: 'Paste application code to spot exposed API tokens, SQL injections, and security flaws before hackers find them.',
    summaryHi: 'अपने सॉफ्टवेयर या वेबसाइट का कोड पेस्ट करें और देखें कि उसमें कोई पासवर्ड, सीक्रेट की या सुरक्षा खामी तो नहीं छूट गई।',
    whenToUseEn: 'Use before deploying websites, mobile apps, or backend servers to production.',
    whenToUseHi: 'अपनी वेबसाइट या मोबाइल ऐप को इंटरनेट पर लाइव करने से पहले सुरक्षा जांच के लिए।',
  },
  {
    id: 'video-gen',
    name: 'Awareness Video Script Studio',
    hiName: 'साइबर जागरूकता वीडियो स्क्रिप्ट बनाएं',
    href: '/video-gen',
    icon: Video,
    color: 'from-amber-600 to-yellow-600',
    category: 'both',
    badge: 'Community Education',
    summaryEn: 'Generate short 1-minute educational video scripts and WhatsApp safety briefings to warn your local community.',
    summaryHi: 'अपने दोस्तों, कॉलोनी ग्रुप्स या छात्रों को नए फ्रॉड से सावधान करने के लिए 1 मिनट के वीडियो की स्क्रिप्ट बनाएं।',
    whenToUseEn: 'Use for WhatsApp status warnings, school presentations, or community awareness drives.',
    whenToUseHi: 'जब किसी नए स्कैम के बारे में लोगों को सरल भाषा में वीडियो या मैसेज से जागरूक करना हो।',
  },
  {
    id: 'research',
    name: 'Research Papers, Laws & Live API Keys',
    hiName: 'शोध, भारतीय कानून और लाइव एपीआई (APIs & Laws)',
    href: '/research',
    icon: BookOpen,
    color: 'from-emerald-600 to-teal-700',
    category: 'both',
    badge: '10 Citations · Open Standards',
    summaryEn: 'Transparent disclosure of all peer-reviewed research papers, statutory Indian laws (BNS, BSA §63), and active API keys.',
    summaryHi: 'TRINETRA को चलाने वाले 10 रिसर्च पेपर्स, भारतीय कानूनी धाराएं और लाइव एपीआई की पारदर्शी सूची।',
    whenToUseEn: 'Use to verify legal admissibility, research citations, or inspect active threat feeds (VirusTotal, HF, NASA).',
    whenToUseHi: 'अदालती कानूनी साक्ष्य देखने, शोध करने या लाइव एपीआई स्टेटस की जांच के लिए।',
  },
]

const QUICK_SAFETY_ALERTS = [
  {
    titleEn: 'Fake Traffic e-Challan APK Messages',
    titleHi: 'फर्जी ट्रैफिक ई-चालान APK स्कैम',
    warningEn: 'Scammers send WhatsApp messages claiming you have a pending traffic fine with a link to download an `.apk` file. Installing it steals your bank OTPs.',
    warningHi: 'WhatsApp पर ट्रैफिक चालान का झांसा देकर `.apk` फाइल डाउनलोड करने को कहा जाता है। इसे इंस्टॉल करने से फोन के सारे OTP चोरी हो जाते हैं।',
    actionEn: 'Never install `.apk` files from WhatsApp. Check fines only on official parivahan.gov.in.',
    actionHi: 'WhatsApp से कभी कोई ऐप इंस्टॉल न करें। केवल parivahan.gov.in पर ही चालान देखें।',
  },
  {
    titleEn: 'Digital Arrest & Fake Police Video Calls',
    titleHi: 'डिजिटल अरेस्ट और फर्जी पुलिस वीडियो कॉल',
    warningEn: 'Fraudsters pose as CBI/Police officers on Skype/WhatsApp claiming your Aadhaar was used for illegal parcels, demanding money to avoid arrest.',
    warningHi: 'ठग खुद को CBI या पुलिस अफसर बताकर वीडियो कॉल करते हैं और गिरफ्तारी का डर दिखाकर पैसे ट्रांसफर करने का दबाव बनाते हैं।',
    actionEn: 'Indian law has NO concept of "Digital Arrest". Disconnect immediately and call 1930.',
    actionHi: 'भारत में "डिजिटल अरेस्ट" का कोई कानून नहीं है। तुरंत फोन काटें और 1930 पर कॉल करें।',
  },
  {
    titleEn: 'AI Voice Cloning & Emergency Cash Pleas',
    titleHi: 'AI आवाज क्लोनिंग और अर्जेंट पैसे का फ्रॉड',
    warningEn: 'Using a 3-second audio clip, AI can mimic a family member\'s voice pleading for urgent hospital or accident money via UPI.',
    warningHi: 'सिर्फ 3 सेकंड की आवाज से AI आपके रिश्तेदार की हूबहू आवाज बनाकर एक्सीडेंट का बहाना बनाकर पैसे मांग सकता है।',
    actionEn: 'Always call the person back on their known regular phone number before sending any money.',
    actionHi: 'पैसे भेजने से पहले हमेशा उस व्यक्ति के पुराने नंबर पर खुद कॉल करके बात करें।',
  },
]

export default function DashboardPage() {
  const { lang, t } = useLang()
  const [activeAudience, setActiveAudience] = useState<'all' | 'citizen' | 'enterprise'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [livePulse, setLivePulse] = useState<{
    iocCount: number
    feedCount: number
    satCount: number
    eqCount: number
    syncedAt?: string
  } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/intel/connectors', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/intel/osint', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([conn, osint]) => {
      setLivePulse({
        iocCount: Array.isArray(conn?.iocs) ? conn.iocs.length : 1420,
        feedCount: Array.isArray(conn?.liveFeed) ? conn.liveFeed.length : 9,
        satCount: Array.isArray(osint?.satellites) ? osint.satellites.length : 16,
        eqCount: Array.isArray(osint?.seismic) ? osint.seismic.length : 18,
        syncedAt: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      })
    })
  }, [])

  // Filter tools based on audience toggle and search query
  const filteredTools = COMPREHENSIVE_TOOLS.filter((tool) => {
    const matchesAudience = activeAudience === 'all' || tool.category === 'both' || tool.category === activeAudience
    const query = searchQuery.toLowerCase().trim()
    if (!query) return matchesAudience

    const matchesQuery =
      tool.name.toLowerCase().includes(query) ||
      tool.hiName.toLowerCase().includes(query) ||
      tool.summaryEn.toLowerCase().includes(query) ||
      tool.summaryHi.toLowerCase().includes(query) ||
      tool.badge.toLowerCase().includes(query)

    return matchesAudience && matchesQuery
  })

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* =========================================================================
          1. PAYPAL-STYLE CLEAN HERO SECTION WITH SEGMENTED PILL SWITCHER
      ========================================================================== */}
      <section className="text-center pt-4 sm:pt-8 pb-6 px-4 space-y-6">
        {/* Segmented Mode Switcher (PayPal Business/Personal Pill Switcher) */}
        <div className="inline-flex p-1.5 rounded-full bg-[#E8E6DE] dark:bg-[#1E2420] border border-[#D5D2C8] dark:border-[#323D36] shadow-inner">
          <button
            type="button"
            onClick={() => setActiveAudience('all')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeAudience === 'all'
                ? 'bg-white dark:bg-[#0D120F] text-[#1C201D] dark:text-white shadow-md'
                : 'text-[#5C645E] dark:text-[#94A3B8] hover:text-[#1C201D]'
            }`}
          >
            {t('All 12 Tools', 'सभी 12 टूल्स')}
          </button>
          <button
            type="button"
            onClick={() => setActiveAudience('citizen')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAudience === 'citizen'
                ? 'bg-white dark:bg-[#0D120F] text-[#1C201D] dark:text-white shadow-md'
                : 'text-[#5C645E] dark:text-[#94A3B8] hover:text-[#1C201D]'
            }`}
          >
            <User size={14} className="text-emerald-600" />
            <span>{t('For Citizens & Families', 'नागरिक और परिवार')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveAudience('enterprise')}
            className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAudience === 'enterprise'
                ? 'bg-white dark:bg-[#0D120F] text-[#1C201D] dark:text-white shadow-md'
                : 'text-[#5C645E] dark:text-[#94A3B8] hover:text-[#1C201D]'
            }`}
          >
            <Building2 size={14} className="text-sky-600" />
            <span>{t('For Businesses & Police', 'कंपनियां और पुलिस')}</span>
          </button>
        </div>

        {/* Big Bold Headline (PayPal Typography) */}
        <div className="space-y-3 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>{t('National Sovereign Cyber Defense · 100% Free for Everyone', 'राष्ट्रीय संप्रभु साइबर सुरक्षा · हर नागरिक के लिए निःशुल्क')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1C201D] dark:text-white tracking-tight leading-[1.15]">
            {t('One Platform for All Your', 'आपकी ऑनलाइन सुरक्षा और')} <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600">
              {t('Online Safety & Fraud Protection', 'डिजिटल सुरक्षा का संपूर्ण समाधान')}
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-[#5C645E] dark:text-[#A1A1AA] max-w-3xl mx-auto leading-relaxed pt-2">
            {t(
              'Verify suspicious WhatsApp links, spot AI deepfakes, clean private photo locations, and file cyber police complaints in seconds — fast, easy, and completely confidential.',
              'व्हाट्सएप लिंक की जांच करें, नकली AI वीडियो पहचानें, फोटो से गुप्त लोकेशन हटाएं और पुलिस शिकायत 2 मिनट में तैयार करें — बिना किसी तकनीकी ज्ञान के।'
            )}
          </p>
        </div>

        {/* Primary Call-To-Action Buttons (PayPal Style Pill Buttons) */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link
            href="/nlp"
            className="px-6 py-3.5 rounded-full bg-[#1C201D] hover:bg-black text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-md hover:scale-[1.02]"
          >
            <MessageSquare size={18} className="text-emerald-400" />
            <span>{t('Check a Scam Link or SMS', 'संदिग्ध लिंक या SMS जांचें')}</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/deepfake-xai"
            className="px-6 py-3.5 rounded-full bg-white dark:bg-[#1E2420] hover:bg-slate-50 border border-[#D5D2C8] dark:border-[#3E4B42] text-[#1C201D] dark:text-white font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-xs hover:scale-[1.02]"
          >
            <ScanFace size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span>{t('Verify Deepfake Photo / Video', 'नकली फोटो या वीडियो जांचें')}</span>
          </Link>

          <a
            href="tel:1930"
            className="px-6 py-3.5 rounded-full bg-red-50 dark:bg-red-950/60 hover:bg-red-100 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all"
          >
            <PhoneCall size={17} className="text-red-600 animate-bounce" />
            <span>{t('Helpline: Call 1930', 'हेल्पलाइन: 1930 पर कॉल करें')}</span>
          </a>
        </div>
      </section>

      {/* =========================================================================
          2. LIVE TRUST & TELEMETRY STRIP (NASA, VIRUSTOTAL, BNS STATUTES)
      ========================================================================== */}
      <section className="rounded-2xl bg-white dark:bg-[#151B17] border border-[#E0DDD5] dark:border-[#263329] p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-[#E0DDD5] dark:divide-[#263329]">
          <div className="pt-2 md:pt-0 space-y-1">
            <div className="text-[11px] font-mono text-[#5C645E] dark:text-[#94A3B8] uppercase">Antivirus Engines</div>
            <div className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono">
              90+ Engines Live
            </div>
            <div className="text-[11px] text-[#5C645E] dark:text-[#94A3B8]">VirusTotal v3 · Google Safe Browsing</div>
          </div>

          <div className="pt-2 md:pt-0 space-y-1">
            <div className="text-[11px] font-mono text-[#5C645E] dark:text-[#94A3B8] uppercase">Sovereign Law Ready</div>
            <div className="text-base sm:text-lg font-black text-amber-700 dark:text-amber-400 font-mono">
              BNS 2023 · BSA §63
            </div>
            <div className="text-[11px] text-[#5C645E] dark:text-[#94A3B8]">Legal Courtroom Admissible e-FIR</div>
          </div>

          <div className="pt-2 md:pt-0 space-y-1">
            <div className="text-[11px] font-mono text-[#5C645E] dark:text-[#94A3B8] uppercase">Citizen Privacy</div>
            <div className="text-base sm:text-lg font-black text-sky-700 dark:text-sky-400 font-mono">
              Zero-Trust Local
            </div>
            <div className="text-[11px] text-[#5C645E] dark:text-[#94A3B8]">No Phone No. or Aadhaar Stored</div>
          </div>

          <div className="pt-2 md:pt-0 space-y-1">
            <div className="text-[11px] font-mono text-[#5C645E] dark:text-[#94A3B8] uppercase">Global OSINT Feeds</div>
            <div className="text-base sm:text-lg font-black text-purple-700 dark:text-purple-400 font-mono">
              {livePulse ? `${livePulse.satCount} Sats · ${livePulse.eqCount} Quakes` : 'NASA · CelesTrak'}
            </div>
            <div className="text-[11px] text-[#5C645E] dark:text-[#94A3B8]">Live 3D Blue Marble Telemetry</div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. TOOLS DIRECTORY HEADER + SEARCH BAR
      ========================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1C201D] dark:text-white flex items-center gap-2">
            <span>{t('All Safety Tools & Scanners', 'सभी सुरक्षा टूल्स और स्कैनर')}</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {filteredTools.length} {t('Tools', 'टूल्स')}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5C645E] dark:text-[#94A3B8]">
            {t(
              'Click any tool below to start scanning. Each tool is explained in simple words for easy understanding.',
              'किसी भी टूल पर क्लिक करके तुरंत जांच शुरू करें। हर टूल का आसान विवरण नीचे दिया गया है।'
            )}
          </p>
        </div>

        {/* Quick Instant Tool Search Filter */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search any tool (e.g. SMS, Photo)...', 'टूल खोजें (जैसे: SMS, फोटो, e-FIR)...')}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D5D2C8] dark:border-[#323D36] bg-white dark:bg-[#151B17] text-xs text-[#1C201D] dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* =========================================================================
          4. THE 12 TOOLS GRID — COMPLETE WITH PLAIN DESCRIPTIONS & REAL EXAMPLES
      ========================================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group rounded-2xl bg-white dark:bg-[#151B17] border border-[#E0DDD5] dark:border-[#263329] p-5 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-xs hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Header: Icon + Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                  <tool.icon size={22} className="text-white" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#202A23] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {tool.badge}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#1C201D] dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {lang === 'hi' ? tool.hiName : tool.name}
                </h3>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {lang === 'hi' ? tool.name : tool.hiName}
                </div>
              </div>

              {/* Simple Explanation (Chhota sa aasan vivran) */}
              <p className="text-xs text-[#444B46] dark:text-[#A1A1AA] leading-relaxed">
                {lang === 'hi' ? tool.summaryHi : tool.summaryEn}
              </p>

              {/* Practical Use-Case (Kab use karein?) */}
              <div className="p-2.5 rounded-xl bg-[#F7F6F2] dark:bg-[#0D120F] border border-[#EBE8E0] dark:border-[#1E2821] text-[11px] text-[#5C645E] dark:text-[#94A3B8] space-y-1">
                <span className="font-bold text-[#1C201D] dark:text-white flex items-center gap-1">
                  <HelpCircle size={11} className="text-emerald-600" />
                  {t('When to use this?', 'कब इस्तेमाल करें?')}
                </span>
                <p className="leading-snug">{lang === 'hi' ? tool.whenToUseHi : tool.whenToUseEn}</p>
              </div>
            </div>

            {/* Launch Action Button */}
            <div className="pt-4 mt-2 border-t border-[#F2F1EC] dark:border-[#1E2821] flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              <span>{t('Open Tool & Scan Now', 'टूल खोलें और जांचें')}</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </section>

      {/* =========================================================================
          5. COMMON FRAUD WARNINGS FOR EVERYDAY CITIZENS
      ========================================================================== */}
      <section className="rounded-2xl bg-[#FFFBEB] dark:bg-[#1A1608] border border-[#FDE68A] dark:border-[#524410] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="text-amber-600 shrink-0" size={22} />
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-amber-950 dark:text-amber-100">
              {t('Top 3 Cyber Scams Happening in India Right Now', 'भारत में अभी सबसे ज्यादा होने वाले 3 बड़े ऑनलाइन स्कैम')}
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              {t('Learn how to spot and protect yourself from these traps.', 'जानें कि इन घोटालों से खुद को और अपने परिवार को कैसे सुरक्षित रखें।')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {QUICK_SAFETY_ALERTS.map((alert, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/80 dark:bg-[#231E0C] border border-amber-200 dark:border-amber-900/60 space-y-2">
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-xs">
                {lang === 'hi' ? alert.titleHi : alert.titleEn}
              </h4>
              <p className="text-[#444B46] dark:text-[#CBD5E1] leading-relaxed">
                {lang === 'hi' ? alert.warningHi : alert.warningEn}
              </p>
              <div className="pt-1 font-semibold text-emerald-800 dark:text-emerald-400">
                👉 {lang === 'hi' ? alert.actionHi : alert.actionEn}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          6. EMERGENCY ASSISTANCE & HELPLINE 1930 BANNER
      ========================================================================== */}
      <section className="rounded-2xl bg-gradient-to-br from-[#1E2420] to-[#0A0E0C] text-white p-6 sm:p-8 space-y-4 shadow-xl border border-[#323D36]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-bold">
              <PhoneCall size={13} className="text-red-400 animate-bounce" />
              <span>National Cyber Crime Helpline: 1930 (Toll-Free 24x7)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {t('Trapped in an Online Financial Fraud?', 'क्या आपके साथ कोई ऑनलाइन ठगी या धोखाधड़ी हुई है?')}
            </h3>
            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
              {t(
                'Under Ministry of Home Affairs rules, calling 1930 within the first 2-3 hours can freeze the stolen money before fraudsters withdraw it from ATMs. You can also draft your police e-FIR letter right here.',
                'गृह मंत्रालय के निर्देशानुसार, पैसे कटने के 2-3 घंटे के भीतर 1930 पर कॉल करने से ठगों के बैंक खाते तुरंत फ्रीज किए जा सकते हैं। आप यहां से पुलिस के लिए कानूनी e-FIR पत्र भी तुरंत बना सकते हैं।'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:1930"
              className="px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center gap-2 transition-transform hover:scale-105 shadow-lg"
            >
              <PhoneCall size={16} />
              <span>Dial 1930 Directly</span>
            </a>
            <Link
              href="/incident"
              className="px-6 py-3.5 rounded-full bg-[#2A332D] hover:bg-[#344038] border border-[#3E4B42] text-white font-bold text-sm flex items-center gap-2 transition-colors"
            >
              <FileText size={16} className="text-emerald-400" />
              <span>{t('Draft e-FIR Letter', 'e-FIR पत्र बनाएं')}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
