import type { Metadata } from 'next'
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
