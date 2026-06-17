import type { Page } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  await page.goto('/auth/login')
  await page.fill('input[type="email"]', 'lucas@4riversrealty.com')
  await page.fill('input[type="password"]', 'admin2024')
  await page.click('button[type="submit"]')
  await page.waitForURL('/admin')
}
