import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono, Cormorant_Garamond } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Fête — Find & Book Event Experiences in Canada',
  description: "Canada's event marketplace for venues, entertainers, and party services.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/auth/callback"
      signUpFallbackRedirectUrl="/auth/callback"
    >
      <html
        lang="en"
        className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} ${cormorant.variable}`}
      >
        <body className="bg-cream text-ink font-sans">{children}</body>
      </html>
    </ClerkProvider>
  )
}
