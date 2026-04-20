import { expect, test, type BrowserContext, type Page } from '@playwright/test'

async function resetBrowserState(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
}

async function seedCodenamesConfig(page: Page, roomId: string) {
  await page.goto('/games/codenames')
  await page.evaluate((nextRoomId) => {
    window.sessionStorage.setItem(
      'codenames:config',
      JSON.stringify({
        roomId: nextRoomId,
        selectedCategories: {},
        settings: { rounds: 2 },
        teams: [
          { name: 'Rubinowi', avatar: 'star' },
          { name: 'Szafirowi', avatar: 'moon' },
        ],
      }),
    )
  }, roomId)
}

async function openCaptain(context: BrowserContext, roomId: string, team: 'red' | 'blue') {
  const page = await context.newPage()
  await page.goto(
    `/games/codenames/captain?room=${roomId}&team=${team}&redName=Rubinowi&redAvatar=star&blueName=Szafirowi&blueAvatar=moon`,
  )
  return page
}

test.describe('codenames host controls', () => {
  test('host runtime supports keyboard flow for wake, rail, settings, reset and assassin modal', async ({ page, context }) => {
    const roomId = `e2e-${Date.now()}`

    await resetBrowserState(page)
    await seedCodenamesConfig(page, roomId)
    await page.goto(`/games/codenames/play?room=${roomId}`)

    await expect(page.getByRole('dialog', { name: /Parowanie kapitan/i })).toBeVisible()

    const redCaptain = await openCaptain(context, roomId, 'red')
    const blueCaptain = await openCaptain(context, roomId, 'blue')

    await expect(redCaptain.getByRole('button', { name: 'Gotowy' })).toBeVisible({ timeout: 20_000 })
    await expect(blueCaptain.getByRole('button', { name: 'Gotowy' })).toBeVisible({ timeout: 20_000 })

    await redCaptain.getByRole('button', { name: 'Gotowy' }).click()
    await blueCaptain.getByRole('button', { name: 'Gotowy' }).click()

    const selectedCard = page.locator('[data-round-index="12"]').first()
    await expect(selectedCard).toBeVisible({ timeout: 20_000 })
    await expect(selectedCard).toBeEnabled({ timeout: 20_000 })
    await expect(selectedCard).not.toHaveClass(/revealed/)

    await page.keyboard.press('Enter')
    await expect(selectedCard).not.toHaveClass(/revealed/)

    await page.keyboard.press('Enter')
    await expect(selectedCard).toHaveClass(/revealed/)

    await page.keyboard.press('R')
    await expect(page.getByText(`Kod: ${roomId}`)).toBeVisible()

    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')
    await expect(page.getByRole('alertdialog', { name: /Wylosowac nowa plansze/i })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('alertdialog', { name: /Wylosowac nowa plansze/i })).toBeHidden()

    await page.keyboard.press('Tab')
    await expect(page.getByRole('dialog', { name: /Ustawienia gry/i })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: /Ustawienia gry/i })).toBeHidden()

    const assassinCard = page.locator('button[data-color="assassin"]:not(.revealed)').first()
    await assassinCard.click()
    await expect(page.getByText('Która drużyna przegrała rundę?')).toBeVisible()

    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await expect(page.getByText(/trafili na zabójcę!/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Kolejna runda' })).toBeVisible()

    await redCaptain.close()
    await blueCaptain.close()
  })
})
