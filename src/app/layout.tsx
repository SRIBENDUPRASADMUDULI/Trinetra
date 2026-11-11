import type { Metadata } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { GlobalShell } from '@/components/shell/GlobalShell'

const interSans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const playfairSerif = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
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
  title: 'TRINETRA | Cinematic 3D Cyber Defense & Statutory Forensics Console',
  description:
    'TRINETRA — Cinematic 3D Cyber Defense Console for BNS 2023 statutory FIR drafting, BSA 2023 §63 evidence certification, phishing inspection, and explainable deepfake forensics.',
  keywords: ['TRINETRA', 'CERT-In', 'NCIIPC', 'BNS 2023', 'BSA 2023', 'IT Act 2000', 'cybercrime', 'India'],
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${interSans.variable} ${playfairSerif.variable} ${jetbrainsMono.variable} ${notoDevanagari.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#03030A" />
      </head>
      <body className={`${interSans.className} antialiased bg-[#03030A] text-[#F5F5F5]`}>
        <GlobalShell>{children}</GlobalShell>
      </body>
    </html>
  )
}
