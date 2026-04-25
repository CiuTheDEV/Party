import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Project Party - Gry',
}

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return children
}
