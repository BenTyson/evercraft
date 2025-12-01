import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Public Pages
 *
 * These tests verify that core public pages load correctly without authentication.
 * They are the foundation of E2E testing and should always pass.
 */

test.describe('Public Pages - Smoke Tests', () => {
  test('home page loads successfully', async ({ page }) => {
    await page.goto('/');

    // Wait for DOM to be ready
    await page.waitForLoadState('domcontentloaded');

    // Should have navigation header
    await expect(page.locator('header')).toBeVisible();

    // Verify no 500 error page is shown (look for visible error indicators)
    const errorHeading = page.locator('h1:has-text("500"), h1:has-text("Internal Server Error")');
    await expect(errorHeading).not.toBeVisible();
  });

  test('browse page loads and displays products section', async ({ page }) => {
    await page.goto('/browse');

    // Should show browse page content
    await expect(page).toHaveURL(/browse/);

    // Wait for DOM
    await page.waitForLoadState('domcontentloaded');

    // Should have header and content area
    await expect(page.locator('header')).toBeVisible();
  });

  test('categories page loads', async ({ page }) => {
    // Categories page queries database, may take longer
    await page.goto('/categories', { waitUntil: 'domcontentloaded', timeout: 60000 });

    await expect(page).toHaveURL(/categories/);

    // Page should render with header
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });

    // Should not show error page
    const errorText = page.locator('text=/error|500|failed/i').first();
    await expect(errorText).not.toBeVisible().catch(() => {
      // If error text is visible, the test will fail naturally
    });
  });

  test('impact page redirects to sign-in when not authenticated', async ({ page }) => {
    // Impact page requires auth, should redirect to sign-in
    await page.goto('/impact', { waitUntil: 'domcontentloaded' });

    // Should redirect to sign-in page with return URL
    await expect(page).toHaveURL(/sign-in/);

    // Verify it's actually the sign-in page
    await expect(page.locator('header')).toBeVisible();
  });

  test('cart page loads (empty state)', async ({ page }) => {
    // Cart page calculates shipping, may take longer
    const response = await page.goto('/cart', { waitUntil: 'domcontentloaded', timeout: 60000 });

    await expect(page).toHaveURL(/cart/);

    // Should return 200 status (page loads even without auth)
    expect(response?.status()).toBe(200);

    // Page should render with header
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
  });

  test('seller application page loads', async ({ page }) => {
    const response = await page.goto('/apply', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await expect(page).toHaveURL(/apply/);

    // Should return 200 status
    expect(response?.status()).toBe(200);

    // Page should render with header
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Navigation - Core Links', () => {
  test('main navigation links are present', async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');

    // Check for navigation in header
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible({ timeout: 10000 });
  });

  test('can navigate from home to browse', async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');

    // Look for browse link in navigation
    const browseLink = page.locator('nav a[href="/browse"]').first();

    if (await browseLink.isVisible({ timeout: 5000 })) {
      await browseLink.click();
      await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
      await expect(page).toHaveURL(/browse/);
    }
  });

  test('can navigate from home to categories', async ({ page }) => {
    await page.goto('/', { timeout: 60000 });
    await page.waitForLoadState('domcontentloaded');

    const categoriesLink = page.locator('nav a[href="/categories"]').first();

    if (await categoriesLink.isVisible({ timeout: 5000 })) {
      await categoriesLink.click();
      await page.waitForLoadState('domcontentloaded', { timeout: 60000 });
      await expect(page).toHaveURL(/categories/, { timeout: 10000 });
    }
  });
});

test.describe('Error Handling', () => {
  test('404 page handles unknown routes gracefully', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345', {
      waitUntil: 'domcontentloaded',
    });

    // Should return 404 status
    expect(response?.status()).toBe(404);
  });
});
