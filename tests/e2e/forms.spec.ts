import { test, expect } from '@playwright/test'

test.describe('Forms & Edge Cases Flow', () => {
  test('should gracefully handle edge cases in project creation', async ({ page }) => {
    // 1. Navigate to projects
    await page.goto('/projects')
    
    // 2. Open "New Project" modal
    await page.click('button:has-text("New Project")')
    await expect(page.locator('h2:has-text("Create Project")')).toBeVisible()

    // 3. Inject extreme boundary values (Emoji, Long strings)
    const longString = 'A'.repeat(500)
    const emojiString = '🔥🔥🔥 Extreme Project 👾👾👾'
    
    await page.fill('input[placeholder="e.g. Website Redesign"]', emojiString)
    
    // Since client selection is a `<select>`, we might just need to pick the first if it exists
    const clientSelect = page.locator('select')
    const optionsCount = await clientSelect.locator('option').count()
    if (optionsCount > 1) {
      await clientSelect.selectOption({ index: 1 })
    }

    // Submit form
    await page.locator('button:has-text("Create Project")').last().click()

    // Expect it to appear or error boundary to be gracefully handled
    // If it succeeds, the modal closes and we should see it
    await expect(page.locator(`text="${emojiString}"`).first()).toBeVisible({ timeout: 5000 })
  })

  test('should create an automation rule', async ({ page }) => {
    await page.goto('/automation')

    // Click New Rule
    await page.click('button:has-text("New Rule")')
    await expect(page.locator('h2:has-text("Create Automation Rule")')).toBeVisible()

    // Fill rule name
    const ruleName = `Edge Case Rule ${Date.now()}`
    await page.fill('input[placeholder="e.g. Welcome Email to New Leads"]', ruleName)

    // Select trigger and action
    await page.locator('select').first().selectOption('lead.converted')
    await page.locator('select').nth(1).selectOption('create.task')

    await page.locator('button:has-text("Create Rule")').last().click()

    // Verify it appears
    await expect(page.locator(`h3:has-text("${ruleName}")`)).toBeVisible()
  })
})
