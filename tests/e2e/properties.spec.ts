import { test, expect } from '@playwright/test'

test.describe('Properties listing', () => {
  test('page loads with grid/map toggle buttons', async ({ page }) => {
    await page.goto('/properties')
    await expect(page.locator('h1')).toContainText('Properties')
    // Toggle buttons are present
    await expect(page.getByRole('button', { name: /grid/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /map/i })).toBeVisible()
  })

  test('grid view shows property cards or empty state', async ({ page }) => {
    await page.goto('/properties')
    // Grid is the default — either cards or empty message appear
    const gridBtn = page.getByRole('button', { name: /grid/i })
    await expect(gridBtn).toBeVisible()
    // Wait for the grid/empty state to render
    await page.waitForTimeout(1500)
    const hasCards = await page.locator('[data-testid="property-card"]').count()
    const hasEmpty = await page.locator('text=No properties found').count()
    expect(hasCards + hasEmpty).toBeGreaterThan(0)
  })

  test('map view toggle switches view', async ({ page }) => {
    await page.goto('/properties')
    const mapBtn = page.getByRole('button', { name: /map/i })
    await mapBtn.click()
    // Map container appears (Leaflet renders a div.leaflet-container)
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 8000 })
  })

  test('grid toggle switches back from map', async ({ page }) => {
    await page.goto('/properties')
    await page.getByRole('button', { name: /map/i }).click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: /grid/i }).click()
    // Leaflet container is gone
    await expect(page.locator('.leaflet-container')).toHaveCount(0)
  })

  test('type filter updates URL params', async ({ page }) => {
    await page.goto('/properties')
    await page.selectOption('select', 'HORSE_FARM')
    await expect(page).toHaveURL(/type=HORSE_FARM/)
  })
})
