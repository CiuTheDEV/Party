import { expect, test, type BrowserContext, type Page } from '@playwright/test'

const DEFAULT_PLAYERS = [
  { name: 'Ala', avatar: 'cat', gender: 'ona' as const },
  { name: 'Bartek', avatar: 'dog', gender: 'on' as const },
  { name: 'Celina', avatar: 'fox', gender: 'ona' as const },
  { name: 'Dawid', avatar: 'bear', gender: 'on' as const },
]

const DEFAULT_SETTINGS = {
  rounds: 3,
  timerSeconds: 15,
  wordChange: {
    enabled: false,
    changesPerPlayer: 1,
    rerollScope: 'word-only' as const,
  },
  hints: {
    enabled: false,
    showCategory: true,
    showWordCount: true,
  },
}

const DEFAULT_SELECTED_CATEGORIES = {
  classic: ['easy', 'hard'] as const,
}

async function resetBrowserState(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
}

async function seedCharadesSetup(page: Page, roomId: string) {
  await page.goto('/games/charades')
  await page.evaluate(
    ({ nextRoomId, players, selectedCategories, settings }) => {
      const setup = {
        roomId: nextRoomId,
        players,
        selectedCategories,
        settings,
      }

      window.localStorage.setItem('charades:setup', JSON.stringify(setup))
      window.sessionStorage.setItem('charades:config', JSON.stringify(setup))
    },
    {
      nextRoomId: roomId,
      players: DEFAULT_PLAYERS,
      selectedCategories: DEFAULT_SELECTED_CATEGORIES,
      settings: DEFAULT_SETTINGS,
    },
  )
}

async function openPresenter(context: BrowserContext, roomId: string) {
  const page = await context.newPage()
  await page.goto(`/games/charades/present/${roomId}`)
  return page
}

async function openHostRuntime(page: Page, roomId: string) {
  await page.goto(`/games/charades/play?room=${roomId}`)
}

async function startRound(host: Page, presenter: Page) {
  await host.getByRole('button', { name: 'Wylosuj kolejność' }).click()
  await host.bringToFront()
  await expect(host.getByText('Losowanie...')).toBeVisible({ timeout: 20_000 })
  await expect(host.getByText('Czekamy, aż prezenter odkryje hasło na telefonie.')).toBeVisible({ timeout: 60_000 })
}

async function awaitNextPresenterTurn(_host: Page, _presenter: Page) {
  await Promise.resolve()
}

async function revealWordAndStopTurn(host: Page, presenter: Page) {
  await presenter.bringToFront()
  await expect(presenter.getByRole('button', { name: 'Odkryj hasło' })).toBeVisible({ timeout: 60_000 })
  await presenter.getByRole('button', { name: 'Odkryj hasło' }).click()
  await host.bringToFront()
  await expect(host.getByRole('button', { name: 'STOP' })).toBeVisible({ timeout: 20_000 })
  await host.getByRole('button', { name: 'STOP' }).click()
  await expect(host.getByRole('button', { name: 'Zgadnięto', exact: true })).toBeVisible({ timeout: 20_000 })
  await expect(host.getByRole('button', { name: 'Nie zgadnięto', exact: true })).toBeVisible()
}

async function giveIncorrectVerdict(host: Page) {
  await host.getByRole('button', { name: 'Nie zgadnięto', exact: true }).click()
  await expect(host.getByRole('dialog', { name: 'Potwierdzenie braku odgadnięcia' })).toBeVisible({ timeout: 10_000 })
  await host.getByRole('button', { name: 'Tak, nie zgadnięto' }).click()
}

async function giveCorrectVerdict(host: Page) {
  await host.getByRole('button', { name: 'Zgadnięto', exact: true }).click()

  const picker = host.getByRole('dialog', { name: 'Wybierz gracza' })
  await expect(picker).toBeVisible({ timeout: 10_000 })

  const playerOptions = picker.locator('button').filter({ hasNotText: 'Wróć' }).filter({ hasNotText: 'Przyznaj punkt' })
  await playerOptions.first().click()
  await picker.getByRole('button', { name: 'Przyznaj punkt' }).click()
}

async function continueFromRoundSummary(host: Page, presenter: Page) {
  await expect(host.getByRole('button', { name: 'Następna runda' })).toBeVisible({ timeout: 20_000 })
  await host.getByRole('button', { name: 'Następna runda' }).click()
}

async function finishTurn(host: Page, presenter: Page, verdict: 'correct' | 'incorrect') {
  await revealWordAndStopTurn(host, presenter)

  if (verdict === 'correct') {
    await giveCorrectVerdict(host)
    return
  }

  await giveIncorrectVerdict(host)
}

test.describe('charades runtime flow', () => {
  test.describe.configure({ timeout: 240_000 })
  test.use({ baseURL: 'http://localhost:3000' })

  test('covers a mixed-verdict flow for 4 players across 3 rounds', async ({ page, context }) => {
    const roomId = `charades-e2e-${Date.now()}`
    const turnsPerRound = DEFAULT_PLAYERS.length
    const verdicts: Array<'correct' | 'incorrect'> = [
      'correct',
      'incorrect',
      'incorrect',
      'incorrect',
      'incorrect',
      'correct',
      'incorrect',
      'incorrect',
      'incorrect',
      'incorrect',
      'incorrect',
      'incorrect',
    ]

    await resetBrowserState(page)
    await seedCharadesSetup(page, roomId)
    await openHostRuntime(page, roomId)
    const presenter = await openPresenter(context, roomId)

    for (const [turnIndex, verdict] of verdicts.entries()) {
      if (turnIndex % turnsPerRound === 0) {
        await startRound(page, presenter)
      } else {
        await awaitNextPresenterTurn(page, presenter)
      }

      await finishTurn(page, presenter, verdict)

      if (turnIndex < verdicts.length - 1) {
        const finishedRound = (turnIndex + 1) % turnsPerRound === 0

        if (finishedRound) {
          await continueFromRoundSummary(page, presenter)
        } else {
          await awaitNextPresenterTurn(page, presenter)
        }
      }
    }

    await expect(page).toHaveURL(/\/games\/charades\/results\/?$/, { timeout: 20_000 })
    await expect(page.getByRole('heading', { name: 'Wyniki kalamburów' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Zagraj jeszcze raz' })).toBeVisible()
    await expect(presenter.getByText('Gra się zakończyła')).toBeVisible({ timeout: 20_000 })

    await presenter.close()
  })

  test('keeps the presenter paired after the host returns to menu', async ({ page, context }) => {
    const roomId = `charades-e2e-${Date.now()}`
    await resetBrowserState(page)
    await seedCharadesSetup(page, roomId)
    await openHostRuntime(page, roomId)
    const presenter = await openPresenter(context, roomId)
    await startRound(page, presenter)

    await page.getByRole('button', { name: 'Ustawienia' }).click()
    await expect(page.getByRole('dialog', { name: 'Ustawienia gry' })).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: 'Powrót do menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Ustawienia gry' }).getByText('Na pewno wrócić do menu?')).toBeVisible({
      timeout: 10_000,
    })
    await page.getByRole('button', { name: 'Tak, wróć do menu' }).click()

    await expect(page).toHaveURL(/\/games\/charades\/?$/, { timeout: 20_000 })
    await expect(presenter.getByText('Host wrócił do menu głównego')).toBeVisible({ timeout: 20_000 })

    await page.getByRole('button', { name: 'Zagraj teraz' }).click()

    const setupDialog = page.getByRole('dialog', { name: 'Kalambury' })
    await expect(setupDialog).toBeVisible()
    await expect(setupDialog.getByText('Połączono')).toBeVisible()
    await expect(setupDialog.getByText('Urządzenie połączone')).toBeVisible()
    await expect(setupDialog.getByRole('button', { name: 'Rozpocznij grę' })).toBeEnabled()

    await presenter.close()
  })
})
