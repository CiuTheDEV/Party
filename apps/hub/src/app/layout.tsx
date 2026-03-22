import type { Metadata } from 'next'
import '@party/ui/tokens.css'
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
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}
