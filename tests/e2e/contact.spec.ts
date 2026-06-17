import { test, expect } from '@playwright/test'

test.describe('Contact page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact')
  })

  test('page renders contact info and form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Contact')
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('required fields show HTML5 validation on empty submit', async ({ page }) => {
    await page.click('button[type="submit"]')
    // Browser prevents submit and focuses name field (it's required)
    const nameInput = page.locator('input[name="name"]')
    const isRequired = await nameInput.getAttribute('required')
    expect(isRequired).not.toBeNull()
  })

  test('admin access button links to login', async ({ page }) => {
    const adminBtn = page.locator('a[href="/auth/login"]')
    await expect(adminBtn).toBeVisible()
  })

  test('Google Maps embed loads', async ({ page }) => {
    const iframe = page.locator('iframe[title*="4Rivers"]')
    await expect(iframe).toBeVisible()
  })
})
