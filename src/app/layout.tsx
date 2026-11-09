import type { Metadata } from 'next'
import { JetBrains_Mono, Inter } from 'next/font/google'
import './globals.css'
import { GlobalShell } from '@/components/shell/GlobalShell'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TRINETRA | Sovereign Cyber Intelligence & SOC Console',
  description:
    'TRINETRA — Elite Sovereign Security Operations Center. Real-time threat monitoring, automated FIR legal dossier generation, digital forensics, and Indian cyber defense intelligence.',
  keywords: ['TRINETRA', 'SOC', 'cybersecurity', 'SIEM', 'threat intelligence', 'incident response', 'India', 'BNS 2023'],
  robots: 'noindex, nofollow',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#08090C" />
      </head>
      <body className={`${inter.className} antialiased bg-[#08090C] text-slate-100`}>
        <GlobalShell>{children}</GlobalShell>
      </body>
    </html>
  )
}
