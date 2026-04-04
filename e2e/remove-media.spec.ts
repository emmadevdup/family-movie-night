import { test, expect } from '@playwright/test'

test.describe('Remove media entry', () => {
  test('Remove button and cancel confirmation modal on detail page', async ({ page }) => {
    // Navigate to the catalogue
    await page.goto('/')

    // Dismiss identity overlay if shown
    const skipBtn = page.getByText(/skip/i).first()
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
    }

    // If no entries exist, skip the test
    const firstCard = page.locator('li').first()
    const hasEntries = await firstCard.isVisible({ timeout: 3000 }).catch(() => false)
    if (!hasEntries) {
      test.skip()
      return
    }

    // Click the first card to go to detail page
    await firstCard.click()
    await page.waitForURL(/\/media\//)

    // Remove button should be visible
    await expect(page.getByTestId('remove-button')).toBeVisible()

    // Click Remove — confirmation modal appears
    await page.getByTestId('remove-button').click()
    await expect(page.getByTestId('cancel-delete-button')).toBeVisible()
    await expect(page.getByTestId('confirm-delete-button')).toBeVisible()

    // Cancel dismisses the modal without deleting
    await page.getByTestId('cancel-delete-button').click()
    await expect(page.getByTestId('cancel-delete-button')).not.toBeVisible()
    // Still on the same detail page
    await expect(page).toHaveURL(/\/media\//)
  })
})
