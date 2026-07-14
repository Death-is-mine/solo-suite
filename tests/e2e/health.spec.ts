import { test, expect } from '@playwright/test'

test('home page redirects to dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/dashboard/)
})

test('leads page loads and shows pipeline', async ({ page }) => {
  await page.goto('/leads')
  await expect(page.locator('h1')).toContainText('Leads')
})

test('clients page loads', async ({ page }) => {
  await page.goto('/clients')
  await expect(page.locator('h1')).toContainText('Clients')
})

test('finance page loads with summary', async ({ page }) => {
  await page.goto('/finance')
  await expect(page.locator('h1')).toContainText('Finance')
})
