import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Party — gry przeglądarkowe',
  description: 'Portal gier imprezowych dla znajomych.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="pl">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
