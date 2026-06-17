import { test, expect } from '@playwright/test'

test.describe('Public pages', () => {
  test('home page loads with logo and hero', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/4Rivers Realty/)
    // Logo image visible in navbar
    const logo = page.locator('img[alt*="4Rivers"]').first()
    await expect(logo).toBeVisible()
    // Hero section has a heading
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('navbar links navigate correctly', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/properties"]')
    await expect(page).toHaveURL('/properties')

    await page.goto('/')
    await page.click('a[href="/about"]')
    await expect(page).toHaveURL('/about')

    await page.goto('/')
    await page.click('a[href="/contact"]')
    await expect(page).toHaveURL('/contact')
  })

  test('WhatsApp CTA button is visible on home', async ({ page }) => {
    await page.goto('/')
    // Wait for the WhatsApp button to appear (has 3s delay)
    const whatsappBtn = page.locator('a[href*="wa.me"]')
    await expect(whatsappBtn).toBeVisible({ timeout: 8000 })
  })

  test('about page renders team section', async ({ page }) => {
    await page.goto('/about')
    await expect(page.locator('h1')).toContainText('About')
    await expect(page.locator('text=Meet Our Team')).toBeVisible()
  })
})
