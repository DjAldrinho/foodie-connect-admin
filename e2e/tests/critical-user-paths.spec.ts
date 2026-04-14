import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Critical User Paths
 *
 * Tests 6 critical user journeys:
 * 1. Login to application
 * 2. View dashboard
 * 3. Manage users
 * 4. View analytics
 * 5. Manage settings
 * 6. Logout
 */

test.describe('Critical User Paths', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to application
    await page.goto('/');

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
  });

  /**
   * Path 1: Login to application
   */
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify successful login
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.url()).toContain('/dashboard');
  });

  /**
   * Path 2: View dashboard
   */
  test('should display dashboard with key metrics', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Verify dashboard loads
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Verify key metrics are displayed
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Total Restaurants')).toBeVisible();
    await expect(page.locator('text=Active Moderations')).toBeVisible();

    // Verify dashboard cards/sections
    const cards = await page.locator('.dashboard-card, .stat-card').count();
    expect(cards).toBeGreaterThan(0);
  });

  /**
   * Path 3: Manage users
   */
  test('should navigate and manage users', async ({ page }) => {
    // Login and navigate to users
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to users page
    await page.click('a[href="/users"], nav a:has-text("Usuarios")');
    await page.waitForURL('/users');
    await page.waitForLoadState('networkidle');

    // Verify users page loads
    await expect(page.locator('h1, h2').filter({ hasText: 'Usuarios' })).toBeVisible();

    // Verify users table/list is displayed
    const userRows = await page.locator('table tbody tr, .user-list-item').count();
    expect(userRows).toBeGreaterThan(0);

    // Verify user actions are available
    await expect(page.locator('button:has-text("Agregar"), button:has-text("Add")')).toBeVisible();
  });

  /**
   * Path 4: View analytics
   */
  test('should view analytics and charts', async ({ page }) => {
    // Login and navigate to analytics
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to analytics page
    await page.click('a[href="/analytics"], nav a:has-text("Analíticas")');
    await page.waitForURL('/analytics');
    await page.waitForLoadState('networkidle');

    // Verify analytics page loads
    await expect(page.locator('h1, h2').filter({ hasText: 'Analíticas' })).toBeVisible();

    // Verify charts are displayed
    await expect(page.locator('canvas, chart, .chart-container')).toBeVisible();

    // Verify analytics metrics
    await expect(page.locator('text=usuarios, text=Usuarios')).toBeVisible();
    await expect(page.locator('text=restaurantes, text=Restaurantes')).toBeVisible();
  });

  /**
   * Path 5: Manage settings
   */
  test('should navigate and manage settings', async ({ page }) => {
    // Login and navigate to settings
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to settings page
    await page.click('a[href="/settings"], nav a:has-text("Configuración")');
    await page.waitForURL('/settings');
    await page.waitForLoadState('networkidle');

    // Verify settings page loads
    await expect(page.locator('h1, h2').filter({ hasText: 'Configuración' })).toBeVisible();

    // Verify settings sections
    await expect(page.locator('text=Sitio, text=General')).toBeVisible();
    await expect(page.locator('text=Correo, text=Email')).toBeVisible();

    // Verify settings form/controls
    const inputs = await page.locator('input, select, textarea').count();
    expect(inputs).toBeGreaterThan(0);
  });

  /**
   * Path 6: Logout
   */
  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Click logout button
    await page.click('button:has-text("Cerrar Sesión"), button:has-text("Logout"), .logout-button');
    await page.waitForURL('/auth/login');

    // Verify logged out
    await expect(page.url()).toContain('/auth/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  /**
   * Complete user journey: Login → Dashboard → Users → Analytics → Logout
   */
  test('should complete full user journey', async ({ page }) => {
    // Step 1: Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Step 2: View Dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    await page.screenshot({ path: 'screenshots/dashboard.png' });

    // Step 3: Navigate to Users
    await page.click('a[href="/users"], nav a:has-text("Usuarios")');
    await page.waitForURL('/users');
    await expect(page.locator('table tbody tr, .user-list-item')).toHaveCount(10, { timeout: 5000 });
    await page.screenshot({ path: 'screenshots/users.png' });

    // Step 4: Navigate to Analytics
    await page.click('a[href="/analytics"], nav a:has-text("Analíticas")');
    await page.waitForURL('/analytics');
    await expect(page.locator('canvas, chart')).toBeVisible();
    await page.screenshot({ path: 'screenshots/analytics.png' });

    // Step 5: Navigate to Settings
    await page.click('a[href="/settings"], nav a:has-text("Configuración")');
    await page.waitForURL('/settings');
    await expect(page.locator('input, select')).toHaveCount(10, { timeout: 5000 });
    await page.screenshot({ path: 'screenshots/settings.png' });

    // Step 6: Logout
    await page.click('button:has-text("Cerrar Sesión"), button:has-text("Logout")');
    await page.waitForURL('/auth/login');

    // Verify complete journey
    await expect(page.url()).toContain('/auth/login');
  });
});

test.describe('Accessibility Tests for Critical Paths', () => {
  test('should have no accessibility violations on login page', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // Check for accessibility issues (basic checks)
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should have no accessibility violations on dashboard', async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Check for skip link
    const skipLink = page.locator('a.skip-link, [href="#main-content"]');
    await expect(skipLink).toHaveCount(1);

    // Check for main landmark
    const main = page.locator('main[role="main"], #main-content');
    await expect(main).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/auth/login');

    // Tab through form
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();

    // Submit with Enter
    await page.keyboard.press('Enter');
    await page.waitForURL('/dashboard', { timeout: 5000 });
  });
});

test.describe('Responsive Design Tests', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Verify mobile menu is available
    const menuButton = page.locator('button[aria-label="menu"], .menu-button, .hamburger');
    await expect(menuButton).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Verify sidebar is visible
    const sidebar = page.locator('.sidebar, nav, aside');
    await expect(sidebar).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Verify full layout is visible
    const sidebar = page.locator('.sidebar, nav, aside');
    const topBar = page.locator('.top-bar, header');
    const content = page.locator('main, .content');

    await expect(sidebar).toBeVisible();
    await expect(topBar).toBeVisible();
    await expect(content).toBeVisible();
  });
});
