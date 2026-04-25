import type { Metadata } from 'next'
import CharadesLayoutClient from './CharadesLayoutClient'

export const metadata: Metadata = {
  title: 'Project Party - Kalambury',
  icons: {
    icon: [{ url: '/favicons/charades.png', type: 'image/png' }],
    shortcut: [{ url: '/favicons/charades.png', type: 'image/png' }],
    apple: [{ url: '/favicons/charades.png', type: 'image/png' }],
  },
}

export default function CharadesLayout({ children }: { children: React.ReactNode }) {
  return <CharadesLayoutClient>{children}</CharadesLayoutClient>
}
