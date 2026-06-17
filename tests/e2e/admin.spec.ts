import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers'

test.describe('Admin panel', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('dashboard renders KPI cards', async ({ page }) => {
    await expect(page).toHaveURL('/admin')
    // At least one stat card is visible (zeros are valid in demo mode)
    const statCards = page.locator('[class*="bg-white"][class*="rounded"]')
    await expect(statCards.first()).toBeVisible()
  })

  test('admin sidebar navigation works', async ({ page }) => {
    // Properties link
    await page.click('a[href="/admin/properties"]')
    await expect(page).toHaveURL('/admin/properties')

    // Leads / CRM link
    await page.click('a[href="/admin/leads"]')
    await expect(page).toHaveURL('/admin/leads')
  })

  test('logout redirects to login', async ({ page }) => {
    const logoutBtn = page.locator('button', { hasText: /log ?out|sign ?out/i })
    await expect(logoutBtn).toBeVisible()
    await logoutBtn.click()
    await page.waitForURL('/auth/login', { timeout: 5000 })
    await expect(page).toHaveURL('/auth/login')
  })
})
