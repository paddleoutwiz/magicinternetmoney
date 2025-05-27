import type { Metadata } from 'next'
import { Caveat } from 'next/font/google'
import './globals.css'

const caveat = Caveat({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-caveat'
})

export const metadata: Metadata = {
  title: 'Bitcoin Wizards - Magic Internet Money',
  description: 'The fairest launch in crypto history. Pure Bitcoin culture, MS Paint mastery, and maximum whimsy.',
  keywords: 'Bitcoin, Wizards, MIM, Magic Internet Money, BRC-20',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${caveat.variable} font-derp bg-[#f5f5f0] overflow-x-hidden cursor-magic-wand`}>
        {children}
      </body>
    </html>
  )
}