import { expect, test, type Page } from '@playwright/test'

async function resetBrowserState(page: Page) {
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
}

test.describe('game setup flows', () => {
  test('codenames keeps the draft and opens captain pairing', async ({ page }) => {
    await resetBrowserState(page)

    await page.goto('/games/codenames')
    await page.getByRole('button', { name: 'Zagraj teraz' }).click()

    const setupDialog = page.getByRole('dialog', { name: 'Tajniacy' })
    await expect(setupDialog).toBeVisible()

    const teamNameInputs = setupDialog.locator('input[type="text"]')
    await teamNameInputs.nth(0).fill('Rubinowi')
    await teamNameInputs.nth(1).fill('Szafirowi')

    await expect(setupDialog.getByRole('button', { name: 'Zagraj' })).toBeDisabled()
    await expect(setupDialog.getByText('Połącz obu kapitanów przed startem gry.')).toBeVisible()

    await setupDialog.getByRole('button', { name: 'Dodaj urządzenia' }).click()

    const pairingDialog = page.getByRole('dialog', { name: /Parowanie kapitan/i })
    await expect(pairingDialog).toBeVisible()
    await expect(pairingDialog.getByText('Kapitan Czerwonych')).toBeVisible()
    await expect(pairingDialog.getByText('Kapitan Niebieskich')).toBeVisible()
    await pairingDialog.getByRole('button', { name: 'Zamknij' }).last().click()
    await expect(pairingDialog).toBeHidden()

    await page.reload()
    await page.getByRole('button', { name: 'Zagraj teraz' }).click()

    const restoredDialog = page.getByRole('dialog', { name: 'Tajniacy' })
    await expect(restoredDialog).toBeVisible()
    await expect(restoredDialog.locator('input[type="text"]').nth(0)).toHaveValue('Rubinowi')
    await expect(restoredDialog.locator('input[type="text"]').nth(1)).toHaveValue('Szafirowi')
  })

  test('charades keeps player draft and opens presenter pairing', async ({ page }) => {
    await resetBrowserState(page)

    await page.goto('/games/charades')
    await page.getByRole('button', { name: 'Zagraj teraz' }).click()

    const setupDialog = page.getByRole('dialog', { name: 'Kalambury' })
    await expect(setupDialog).toBeVisible()

    const quickAddButton = setupDialog.getByRole('button', { name: 'Szybki test' })
    await quickAddButton.click()
    await quickAddButton.click()

    await expect(setupDialog.getByText('2/12')).toBeVisible()
    await expect(setupDialog.getByRole('button', { name: 'Rozpocznij grę' })).toBeDisabled()
    await expect(setupDialog.getByText('Połącz urządzenie prezentera.')).toBeVisible()

    await setupDialog.getByRole('button', { name: 'Dodaj urządzenia' }).click()
    await expect(page.getByText('Podłącz urządzenie prezentera')).toBeVisible()

    await page.reload()
    await page.getByRole('button', { name: 'Zagraj teraz' }).click()

    const restoredDialog = page.getByRole('dialog', { name: 'Kalambury' })
    await expect(restoredDialog).toBeVisible()
    await expect(restoredDialog.getByText('2/12')).toBeVisible()
  })
})
