import { test, expect } from '@playwright/test'

test.describe('CRM Flow', () => {
  test('should create a lead, move it to won, and verify it converts to a client', async ({ page }) => {
    // 1. Navigate to leads page
    await page.goto('/leads')
    await expect(page.locator('h1')).toContainText('Keep momentum visible')

    // 2. Open Add Lead form
    await page.click('button:has-text("Add lead")')
    await expect(page.locator('h2:has-text("Add a lead")')).toBeVisible()

    // 3. Fill and submit the form
    const leadName = `Test Lead ${Date.now()}`
    const leadEmail = `test${Date.now()}@example.com`
    await page.fill('input[placeholder="Full name or company"]', leadName)
    await page.fill('input[placeholder="Email address (optional)"]', leadEmail)
    await page.click('button:has-text("Create lead")')

    // 4. Verify lead appears in the "New" column
    const leadCard = page.locator(`article:has-text("${leadName}")`)
    await expect(leadCard).toBeVisible()

    // 5. Advance lead through stages to "Won"
    const advanceButton = leadCard.locator('button:has-text("Advance")')
    
    // New -> Contacted
    await advanceButton.click()
    // Wait for it to move to Contacted column (which comes after New)
    // The columns are just rendering the stage, we can just click advance multiple times
    await page.waitForTimeout(500)
    
    // Contacted -> Qualified
    await advanceButton.click()
    await page.waitForTimeout(500)
    
    // Qualified -> Proposal Sent
    await advanceButton.click()
    await page.waitForTimeout(500)
    
    // Proposal Sent -> Won
    await advanceButton.click()
    await page.waitForTimeout(500)

    // 6. Verify lead disappears from active pipeline (since it's won)
    // Wait for the UI to update
    await expect(leadCard.locator('button:has-text("Advance")')).toHaveCount(0)

    // 7. Navigate to clients page
    await page.goto('/clients')
    await expect(page.locator('h1')).toContainText('Clients, with context')

    // 8. Verify the converted client is visible
    const clientCard = page.locator(`article:has-text("${leadName}")`)
    await expect(clientCard).toBeVisible()
    await expect(clientCard).toContainText(leadEmail)
  })

  test('should allow manual creation of a client', async ({ page }) => {
    await page.goto('/clients')
    
    // 1. Open Add Client form
    await page.click('button:has-text("Add client")')
    await expect(page.locator('h2:has-text("Add a client")')).toBeVisible()

    // 2. Fill and submit
    const companyName = `Test Company ${Date.now()}`
    await page.fill('input[placeholder="Company name"]', companyName)
    await page.fill('input[placeholder="Primary contact"]', 'Jane Doe')
    await page.fill('input[placeholder="Email address"]', 'jane@example.com')
    await page.click('button:has-text("Create client")')

    // 3. Verify client appears in the list
    const clientCard = page.locator(`article:has-text("${companyName}")`)
    await expect(clientCard).toBeVisible()
    await expect(clientCard).toContainText('Jane Doe')
  })
})
