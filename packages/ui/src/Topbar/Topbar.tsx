import Link from 'next/link'
import { Epilogue, Manrope } from 'next/font/google'
import styles from './Topbar.module.css'

type TopbarProps = {
  gameName?: string
}

const headingFont = Epilogue({ subsets: ['latin'], weight: ['700', '800', '900'] })
const bodyFont = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

export function Topbar({ gameName: _gameName }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <Link href="/" className={`${styles.topbarBrand} ${headingFont.className}`}>
          {`PROJECT PARTY${_gameName ? ` / ${_gameName.toUpperCase()}` : ''}`}
        </Link>

        <button className={`${styles.loginButton} ${bodyFont.className}`} type="button" aria-label="Zaloguj">
          Zaloguj
        </button>
      </div>
    </header>
  )
}
