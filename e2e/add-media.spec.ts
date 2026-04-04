import { test, expect } from '@playwright/test'

// TMDB API responses are mocked at the route level using Playwright route interception.
// Requires at least one family member seeded in the local Supabase instance.

const MOCK_SEARCH_RESULTS = [
  {
    tmdb_id: 550,
    title: 'Fight Club',
    year: '1999',
    type: 'movie',
    poster_url: null,
  },
]

const MOCK_DETAILS = {
  tmdb_id: 550,
  title: 'Fight Club',
  type: 'movie',
  duration_minutes: 139,
  genre: 'Drama',
  poster_url: null,
  summary: 'An insomniac office worker forms an underground fight club.',
  trailer_url: 'https://www.youtube.com/watch?v=SUXWAEX2jlg',
  total_seasons: null,
  total_episodes: null,
}

test.describe('add media via TMDB', () => {
  test.beforeEach(async ({ page }) => {
    // Mock TMDB API routes
    await page.route('/api/tmdb/search', (route) =>
      route.fulfill({ json: MOCK_SEARCH_RESULTS })
    )
    await page.route('/api/tmdb/details**', (route) =>
      route.fulfill({ json: MOCK_DETAILS })
    )

    // Dismiss Who's watching overlay (select first member)
    await page.goto('/add')
    const overlay = page.getByTestId('whos-watching-overlay')
    if (await overlay.isVisible()) {
      await overlay.locator('[data-testid^="member-btn-"]').first().click()
    }
    await page.goto('/add')
  })

  test('search returns results with title and type badge', async ({ page }) => {
    await page.getByTestId('tmdb-search-input').fill('Fight Club')
    await page.getByTestId('tmdb-search-btn').click()

    const results = page.getByTestId('tmdb-results')
    await expect(results).toBeVisible()
    await expect(results.getByText('Fight Club')).toBeVisible()
    await expect(results.getByText('Movie')).toBeVisible()
  })

  test('selecting a result fills the metadata form', async ({ page }) => {
    await page.getByTestId('tmdb-search-input').fill('Fight Club')
    await page.getByTestId('tmdb-search-btn').click()
    await page.getByTestId('tmdb-result-550').click()

    // Should be on metadata step with auto-filled title
    await expect(page.getByDisplayValue('Fight Club')).toBeVisible()
    await expect(page.getByDisplayValue('139')).toBeVisible()
  })

  test('completing the flow saves the entry and redirects to catalogue', async ({ page }) => {
    await page.getByTestId('tmdb-search-input').fill('Fight Club')
    await page.getByTestId('tmdb-search-btn').click()
    await page.getByTestId('tmdb-result-550').click()

    // Metadata step — click Next
    await page.getByRole('button', { name: 'Next' }).click()

    // Interest step — click Save
    await page.getByRole('button', { name: 'Save to catalogue' }).click()

    // Should redirect to catalogue
    await expect(page).toHaveURL('/')
  })
})
