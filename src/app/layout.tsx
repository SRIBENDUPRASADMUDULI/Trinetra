import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { GlobalShell } from '@/components/shell/GlobalShell'

const interSans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hindi',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TRINETRA | Sovereign Cyber Safety & Scam Defense Console',
  description:
    'Check suspicious SMS or WhatsApp messages, verify links, spot edited photos or deepfake videos, check leaked data, and prepare cybercrime complaints (1930).',
  keywords: ['TRINETRA', 'scam checker', 'phishing', '1930 helpline', 'cybercrime India', 'BNS 2023', 'BSA 2023'],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${interSans.variable} ${jetbrainsMono.variable} ${notoDevanagari.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#1E2420" />
      </head>
      <body className={`${interSans.className} antialiased bg-[#F7F6F2] text-[#1C201D]`}>
        <GlobalShell>{children}</GlobalShell>
      </body>
    </html>
  )
}
