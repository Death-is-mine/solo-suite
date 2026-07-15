import { test, expect } from '@playwright/test'

test.describe('Security & Input Validation Checks', () => {
  const XSS_PAYLOAD = '<script>alert("xss")</script><img src="x" onerror="alert(1)">'
  const SQLI_PAYLOAD = "' OR '1'='1"
  const LARGE_PAYLOAD = 'A'.repeat(5000)

  test('Route /leads form should handle XSS and SQLi payloads gracefully', async ({ page }) => {
    await page.goto('/leads')
    
    // Attempt to open "New Lead" dialog (assuming there's a button for it)
    const newLeadBtn = page.getByRole('button', { name: /New Lead/i })
    
    if (await newLeadBtn.isVisible()) {
      await newLeadBtn.click()
      
      // Look for common form fields
      const nameInput = page.getByLabel(/name/i).first()
      const emailInput = page.getByLabel(/email/i).first()
      const submitBtn = page.getByRole('button', { name: /save|create/i })
      
      if (await nameInput.isVisible() && await emailInput.isVisible()) {
        await nameInput.fill(XSS_PAYLOAD)
        await emailInput.fill(`test${Date.now()}@example.com`)
        await submitBtn.click()
        
        // Wait for potential rendering
        await page.waitForTimeout(500)
        
        // Ensure no raw script tags are rendered in the DOM
        const bodyText = await page.innerHTML('body')
        expect(bodyText).not.toContain('<script>alert("xss")</script>')
      }
    }
  })

  test('Route /clients should not crash with excessively large payloads', async ({ page }) => {
    await page.goto('/clients')
    
    const searchInput = page.getByPlaceholder(/search/i).first()
    if (await searchInput.isVisible()) {
      await searchInput.fill(LARGE_PAYLOAD)
      // trigger search
      await searchInput.press('Enter')
      
      await page.waitForTimeout(500)
      
      // Page should still be alive, no 500 errors visible
      const bodyText = await page.innerText('body')
      expect(bodyText.toLowerCase()).not.toContain('internal server error')
      expect(bodyText.toLowerCase()).not.toContain('runtime error')
    }
  })

  test('Route /tasks handles special characters without crashing', async ({ page }) => {
    await page.goto('/tasks')
    
    const searchInput = page.getByPlaceholder(/search/i).first()
    if (await searchInput.isVisible()) {
      await searchInput.fill(SQLI_PAYLOAD)
      await searchInput.press('Enter')
      
      await page.waitForTimeout(500)
      
      const bodyText = await page.innerText('body')
      expect(bodyText.toLowerCase()).not.toContain('syntax error')
      expect(bodyText.toLowerCase()).not.toContain('unclosed quotation mark')
    }
  })
})
