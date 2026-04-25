import type { Metadata } from 'next'
import { Providers } from './providers'
import '@party/ui/tokens.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Project Party',
  description: 'Portal gier imprezowych dla znajomych.',
  icons: {
    icon: [{ url: '/favicons/hub.png', type: 'image/png' }],
    shortcut: [{ url: '/favicons/hub.png', type: 'image/png' }],
    apple: [{ url: '/favicons/hub.png', type: 'image/png' }],
  },
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
