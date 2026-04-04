import { test, expect } from '@playwright/test'

// These tests require a seeded local Supabase instance.
// Seed: at least one family member with a known name and avatar_id.

test.describe('identity selection', () => {
  test.beforeEach(async ({ page }) => {
    // Clear activeUserId so overlay always shows fresh
    await page.goto('/')
    await page.evaluate(() => localStorage.removeItem('activeUserId'))
    await page.reload()
  })

  test('overlay appears on load', async ({ page }) => {
    await expect(page.getByTestId('whos-watching-overlay')).toBeVisible()
  })

  test('selecting a member dismisses the overlay and shows their avatar in the header', async ({
    page,
  }) => {
    const overlay = page.getByTestId('whos-watching-overlay')
    await overlay.waitFor()

    // Click the first member button
    const firstMember = overlay.locator('[data-testid^="member-btn-"]').first()
    await firstMember.click()

    await expect(overlay).not.toBeVisible()
    await expect(page.getByTestId('header-avatar-btn')).toBeVisible()
  })

  test('"Stay as [Name]" shortcut dismisses overlay without switching user', async ({ page }) => {
    // First select a user
    await page.getByTestId('whos-watching-overlay').locator('[data-testid^="member-btn-"]').first().click()

    // Reopen overlay via header button
    await page.getByTestId('header-avatar-btn').click()
    await expect(page.getByTestId('whos-watching-overlay')).toBeVisible()

    // Click stay-as button
    await page.getByTestId('stay-as-btn').click()
    await expect(page.getByTestId('whos-watching-overlay')).not.toBeVisible()
  })

  test('tapping header avatar reopens the overlay', async ({ page }) => {
    // Select a user first
    await page.getByTestId('whos-watching-overlay').locator('[data-testid^="member-btn-"]').first().click()

    // Reopen
    await page.getByTestId('header-avatar-btn').click()
    await expect(page.getByTestId('whos-watching-overlay')).toBeVisible()
  })
})
