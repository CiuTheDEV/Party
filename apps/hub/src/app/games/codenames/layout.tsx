import type { Metadata } from 'next'
import CodenamesLayoutClient from './CodenamesLayoutClient'

export const metadata: Metadata = {
  title: 'Project Party - Tajniacy',
  icons: {
    icon: [{ url: '/favicons/codenames.png', type: 'image/png' }],
    shortcut: [{ url: '/favicons/codenames.png', type: 'image/png' }],
    apple: [{ url: '/favicons/codenames.png', type: 'image/png' }],
  },
}

export default function CodenamesLayout({ children }: { children: React.ReactNode }) {
  return <CodenamesLayoutClient>{children}</CodenamesLayoutClient>
}
