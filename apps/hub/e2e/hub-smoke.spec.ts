import { expect, test } from '@playwright/test'

test.describe('hub smoke', () => {
  test('loads the home page and game routes', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Party/i)
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('a[href="/games/"]').first()).toBeVisible()

    await page.goto('/games')
    await expect(page).toHaveURL(/\/games\/?$/)
    await expect(page.locator('input[type="search"]')).toBeVisible()

    await page.goto('/games/codenames')
    await expect(page).toHaveURL(/\/games\/codenames\/?$/)
    await expect(page.locator('text=Tajniacy').first()).toBeVisible()
  })
})
