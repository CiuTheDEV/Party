import type { Metadata } from 'next'
import Script from 'next/script'
import { Providers } from './providers'
import '@party/ui/tokens.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Party - gry przeglądarkowe',
  description: 'Portal gier imprezowych dla znajomych.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <head>
        <Script
          src="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@6/dist/clerk.browser.js"
          data-clerk-publishable-key={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
