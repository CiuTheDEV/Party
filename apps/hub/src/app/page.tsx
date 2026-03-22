import { Topbar } from '@/components/Topbar/Topbar'
import { GamesGrid } from '@/components/GamesGrid/GamesGrid'
import { games } from '@/data/games'

export default function HomePage() {
  return (
    <>
      <Topbar />
      <main>
        <GamesGrid games={games} />
      </main>
    </>
  )
}
