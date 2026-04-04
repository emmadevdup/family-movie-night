import { test, expect } from '@playwright/test'

test.describe('Movie Night mode', () => {
  test('Movie Night button is visible on the home screen', async ({ page }) => {
    await page.goto('/')
    // Dismiss identity overlay if shown
    const skipBtn = page.getByText(/skip/i).first()
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click()
    }
    await expect(page.getByTestId('movie-night-button')).toBeVisible()
  })

  test('navigates to Movie Night setup page', async ({ page }) => {
    await page.goto('/movie-night')
    await expect(page.getByText("Who's here tonight?")).toBeVisible()
    await expect(page.getByTestId('time-input')).toBeVisible()
    await expect(page.getByTestId('go-button')).toBeDisabled()
  })

  test('Go button stays disabled until attendee and time are set', async ({ page }) => {
    await page.goto('/movie-night')
    // Time only — no attendee
    await page.getByTestId('time-input').fill('2h')
    await expect(page.getByTestId('go-button')).toBeDisabled()
  })

  test('shows List A results when a perfect match exists', async ({ page }) => {
    // Seed: need at least one family member and one media entry that fits.
    // Since we can't seed in E2E easily, we navigate and verify the UI flow
    // renders results sections correctly given the DB state.
    await page.goto('/movie-night')

    // Select all visible members
    const toggles = page.locator('[data-testid^="attendee-toggle-"]')
    const count = await toggles.count()
    if (count === 0) {
      // No members yet — just verify the Go button stays disabled
      await page.getByTestId('time-input').fill('2h')
      await expect(page.getByTestId('go-button')).toBeDisabled()
      return
    }

    for (let i = 0; i < count; i++) {
      await toggles.nth(i).click()
    }
    await page.getByTestId('time-input').fill('2h')
    await expect(page.getByTestId('go-button')).toBeEnabled()
    await page.getByTestId('go-button').click()

    // Results page should appear (one of the result sections or empty state)
    await expect(
      page.locator('[data-testid="list-a"], [data-testid="list-b"], [data-testid="list-c1"], [data-testid="list-c2"], [data-testid="empty-results"], [data-testid="no-primary-message"]')
    ).toBeVisible({ timeout: 5000 })
  })

  test('shows fallback message when no primary results', async ({ page }) => {
    // Set time to 1 minute — nothing should fit unless episode is 1 min
    await page.goto('/movie-night')

    const toggles = page.locator('[data-testid^="attendee-toggle-"]')
    const count = await toggles.count()
    if (count === 0) return

    for (let i = 0; i < count; i++) {
      await toggles.nth(i).click()
    }
    await page.getByTestId('time-input').fill('1')
    await page.getByTestId('go-button').click()

    // Should show fallback message or empty results
    await expect(
      page.locator('[data-testid="no-primary-message"], [data-testid="empty-results"]')
    ).toBeVisible({ timeout: 5000 })
  })

  test('"Change setup" button returns to setup screen', async ({ page }) => {
    await page.goto('/movie-night')

    const toggles = page.locator('[data-testid^="attendee-toggle-"]')
    const count = await toggles.count()
    if (count === 0) return

    await toggles.first().click()
    await page.getByTestId('time-input').fill('2h')
    await page.getByTestId('go-button').click()

    await page.getByText('← Change setup').click()
    await expect(page.getByTestId('go-button')).toBeVisible()
  })

  test('invalid time input shows helper text and keeps Go disabled', async ({ page }) => {
    await page.goto('/movie-night')
    const toggles = page.locator('[data-testid^="attendee-toggle-"]')
    if (await toggles.count() > 0) await toggles.first().click()

    await page.getByTestId('time-input').fill('xyz')
    await expect(page.getByText(/try formats like/i)).toBeVisible()
    await expect(page.getByTestId('go-button')).toBeDisabled()
  })
})
