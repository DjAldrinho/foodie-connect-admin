import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Audit Suite
 *
 * Tests all major pages for WCAG AA compliance using AXE
 *
 * Run with: npx playwright test e2e/accessibility/accessibility-audit.spec.ts
 */

const pages = [
  { name: 'Login', url: '/auth/login', needsAuth: false },
  { name: 'Dashboard', url: '/dashboard', needsAuth: true },
  { name: 'Users List', url: '/users', needsAuth: true },
  { name: 'Restaurants List', url: '/restaurants', needsAuth: true },
  { name: 'Moderation Queue', url: '/moderation', needsAuth: true },
  { name: 'Notifications List', url: '/notifications', needsAuth: true },
  { name: 'Notifications Composer', url: '/notifications/compose', needsAuth: true },
  { name: 'Analytics Dashboard', url: '/analytics/users', needsAuth: true },
  { name: 'Settings - Site', url: '/settings/site', needsAuth: true },
  { name: 'Settings - Security', url: '/settings/security', needsAuth: true },
];

test.describe('Accessibility AXE Audits', () => {
  pages.forEach((page) => {
    test(`${page.name} - WCAG AA compliance`, async ({ page }) => {
      // Navigate to page
      await page.goto(page.url);

      // Wait for page to load completely
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Allow for animations to complete

      // Run AXE audit
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log violations if any
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n=== ${page.name} - Accessibility Violations ===`);
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`\n❌ ${violation.id} - ${violation.description}`);
          console.log(`   Impact: ${violation.impact}`);
          console.log(`   Help: ${violation.helpUrl}`);
          console.log(`   Affected elements: ${violation.nodes.length}`);
          violation.nodes.forEach((node) => {
            console.log(`   - ${node.html}`);
          });
        });
      }

      // Assert no violations (or at least no critical/serious ones)
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(
        criticalViolations.length,
        `${page.name} has ${criticalViolations.length} critical/serious accessibility violations`
      ).toBe(0);
    });
  });

  test('Login page - Complete audit', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('body')
      .analyze();

    // Generate detailed report
    console.log(`\n=== Complete Accessibility Report: Login Page ===`);
    console.log(`Violations: ${accessibilityScanResults.violations.length}`);
    console.log(`Passes: ${accessibilityScanResults.passes.length}`);

    accessibilityScanResults.violations.forEach((violation) => {
      console.log(`\n❌ ${violation.id}`);
      console.log(`   Description: ${violation.description}`);
      console.log(`   Impact: ${violation.impact}`);
      console.log(`   Help: ${violation.help}`);
      console.log(`   Help URL: ${violation.helpUrl}`);
      console.log(`   Nodes affected: ${violation.nodes.length}`);
    });

    // Save report to file
    const fs = require('fs');
    const reportPath = 'test-results/accessibility-report.json';
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(accessibilityScanResults, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
  });
});
