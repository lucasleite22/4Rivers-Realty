import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page renders form', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('wrong credentials show error message', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    // Error message appears
    const error = page.locator('text=/invalid|incorrect|wrong|error/i')
    await expect(error).toBeVisible({ timeout: 5000 })
  })

  test('correct credentials redirect to admin', async ({ page }) => {
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'lucas@4riversrealty.com')
    await page.fill('input[type="password"]', 'admin2024')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin', { timeout: 8000 })
    await expect(page).toHaveURL('/admin')
  })
})
