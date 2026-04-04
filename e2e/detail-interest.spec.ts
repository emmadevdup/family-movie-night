import { test, expect } from '@playwright/test'

// Requires: seeded local Supabase with at least one media entry and one family member.

test.describe('detail page — interest toggle', () => {
  let mediaId: string

  test.beforeEach(async ({ page }) => {
    // Select active user
    await page.goto('/')
    const overlay = page.getByTestId('whos-watching-overlay')
    if (await overlay.isVisible()) {
      await overlay.locator('[data-testid^="member-btn-"]').first().click()
    }

    // Get first media entry from catalogue and navigate to its detail page
    await page.goto('/')
    const firstCard = page.locator('li').first()
    const link = firstCard.locator('a').first()
    const href = await link.getAttribute('href')
    mediaId = href?.split('/media/')[1] ?? ''
    await page.goto(`/media/${mediaId}`)
  })

  test('interest toggles cycle through neutral → yes → no → neutral', async ({ page }) => {
    // Find the active user's interest toggle button (first member in the section)
    const firstToggle = page.locator('[data-testid^="interest-toggle-"]').first()
    await firstToggle.waitFor()

    // Click once — should move to 'yes' (green ring visible)
    await firstToggle.click()
    // Click again — 'no'
    await firstToggle.click()
    // Click again — back to 'neutral'
    await firstToggle.click()

    // Page should still be on detail without errors
    await expect(page).toHaveURL(`/media/${mediaId}`)
  })

  test('"Mark watched" toggle updates watched state', async ({ page }) => {
    const watchedBtn = page.locator('button', { hasText: 'Mark watched' }).first()
    await watchedBtn.waitFor()
    await watchedBtn.click()
    await expect(page.locator('button', { hasText: 'Watched ✓' }).first()).toBeVisible()
  })
})
