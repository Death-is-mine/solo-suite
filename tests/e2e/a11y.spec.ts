import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const routes = [
  '/',
  '/dashboard',
  '/leads',
  '/clients',
  '/projects',
  '/tasks',
  '/meetings',
  '/calendar',
  '/finance',
  '/agreements',
  '/automation',
  '/reports',
  '/workspace',
]

test.describe('Accessibility (a11y) Checks', () => {
  for (const route of routes) {
    test(`Route ${route} should not have any automatically detectable accessibility issues`, async ({ page }) => {
      await page.goto(route)
      // wait for main content to render (give it a bit of time for animations or data fetching)
      await page.waitForTimeout(1000)

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(accessibilityScanResults.violations).toEqual([])
    })
  }
})
