import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Serif, JetBrains_Mono, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { GlobalShell } from '@/components/shell/GlobalShell'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
  title: 'TRINETRA | National Cyber Defense & Incident Response Console',
  description:
    'TRINETRA — Official-grade National Cyber Defense Console for BNS 2023 statutory incident response, BSA 2023 §63 evidence certification, phishing & URL inspection, and explainable deepfake forensics.',
  keywords: ['TRINETRA', 'CERT-In', 'NCIIPC', 'BNS 2023', 'BSA 2023', 'IT Act 2000', 'cybercrime', 'India'],
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable} ${jetbrainsMono.variable} ${notoDevanagari.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#0A192F" />
      </head>
      <body className={`${ibmPlexSans.className} antialiased bg-[#0A192F] text-[#F8F9FA]`}>
        <GlobalShell>{children}</GlobalShell>
      </body>
    </html>
  )
}
