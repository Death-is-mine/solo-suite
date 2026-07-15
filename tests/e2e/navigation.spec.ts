import { test, expect } from '@playwright/test'

const ROUTES = [
  { path: '/dashboard', title: 'Dashboard' },
  { path: '/leads', title: 'Leads' },
  { path: '/clients', title: 'Clients' },
  { path: '/projects', title: 'Projects' },
  { path: '/tasks', title: 'Tasks' },
  { path: '/meetings', title: 'Meetings' },
  { path: '/calendar', title: 'Calendar' },
  { path: '/finance', title: 'Finance' },
  { path: '/agreements', title: 'Agreements' },
  { path: '/automation', title: 'Automation' },
  { path: '/reports', title: 'Reports' },
  { path: '/workspace', title: 'Workspace Settings' },
]

test.describe('Navigation Flow', () => {
  for (const route of ROUTES) {
    test(`should navigate successfully to ${route.path} and display content`, async ({ page }) => {
      await page.goto(route.path)
      // Wait for content to render. We look for a heading or the main wrapper.
      const heading = page.locator('h1, h2, h3, .text-3xl').first()
      await expect(heading).toBeVisible({ timeout: 10000 })
    })
  }

  test('should handle 404 for invalid routes gracefully', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist')
    // Next.js returns 404
    expect(response?.status()).toBe(404)
    await expect(page.locator('text="404"').first()).toBeVisible()
  })
})
