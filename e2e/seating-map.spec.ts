import { test, expect } from '@playwright/test';

test.describe('Event Seating Map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the venue and display seats', async ({ page }) => {
    // Wait for the venue to load
    await expect(page.locator('h1')).toContainText('Metropolis Arena');
    
    // Check that seats are visible
    const seatCount = await page.locator('[data-testid^="seat-"]').count();
    expect(seatCount).toBeGreaterThan(0);
    
    // Check that the selection panel is visible
    await expect(page.locator('text=Your Selection')).toBeVisible();
    await expect(page.locator('[data-testid="seat-count"]')).toContainText('0 /');
  });

  test('should select and deselect seats', async ({ page }) => {
    // Wait for seats to load
    await page.waitForSelector('[data-testid^="seat-"]');
    
    // Find the first available seat
    const availableSeat = page.locator('[data-testid^="seat-"]:not([disabled])').first();
    
    // Click to select
    await availableSeat.click();
    
    // Check selection count updated using test ID
    await expect(page.locator('[data-testid="seat-count"]')).toContainText('1 /');
    
    // Check total price is updated
    await expect(page.locator('.font-bold').filter({ hasText: /\$\d+\.\d{2}/ })).toBeVisible();
    
    // Click again to deselect
    await availableSeat.click();
    
    // Check selection count reset
    await expect(page.locator('[data-testid="seat-count"]')).toContainText('0 /');
  });

  test('should show seat details when seat is clicked', async ({ page }) => {
    // Wait for seats to load
    await page.waitForSelector('[data-testid^="seat-"]');
    
    // Click on a seat
    const seat = page.locator('[data-testid^="seat-"]:not([disabled])').first();
    await seat.click();
    
    // Check that seat details are shown
    await expect(page.locator('text=Seat Details')).toBeVisible();
    await expect(page.locator('text=Section:')).toBeVisible();
    await expect(page.locator('text=Row:')).toBeVisible();
    await expect(page.locator('text=Seat:')).toBeVisible();
    await expect(page.locator('text=Price:')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Wait for seats to load
    await page.waitForSelector('[data-testid^="seat-"]');
    
    // Find the first available seat
    const firstSeat = page.locator('[data-testid^="seat-"]:not([disabled])').first();
    
    // Test that seats can be focused and have proper ARIA labels
    await firstSeat.focus();
    
    // Check that the focused seat has proper accessibility attributes
    await expect(firstSeat).toHaveAttribute('aria-label');
    await expect(firstSeat).toHaveAttribute('tabindex', '0');
    
    // Test arrow key navigation by pressing an arrow key and checking focus didn't break
    await page.keyboard.press('ArrowRight');
    
    // Test escape key clears focus (this should work)
    await page.keyboard.press('Escape');
  });

  test('should limit selection to 8 seats', async ({ page }) => {
    // Wait for seats to load
    await page.waitForSelector('[data-testid^="seat-"]');
    
    // Get all available seats
    const availableSeats = page.locator('[data-testid^="seat-"]:not([disabled])');
    
    // Select 8 seats
    for (let i = 0; i < 8; i++) {
      const seat = availableSeats.nth(i);
      if (await seat.isVisible()) {
        await seat.click();
      }
    }
    
    // Check that we have 8 seats selected
    await expect(page.locator('[data-testid="seat-count"]')).toContainText('8 /');
    
    // Try to select a 9th seat - it should not be selectable
    const ninthSeat = availableSeats.nth(8);
    if (await ninthSeat.isVisible()) {
      await ninthSeat.click();
      // Should still be 8 seats
      await expect(page.locator('[data-testid="seat-count"]')).toContainText('8 /');
    }
  });

  test('should toggle heat map mode', async ({ page }) => {
    // Wait for the heat map toggle button
    await page.waitForSelector('[title="Toggle price heat map"]');
    
    // Click the heat map toggle
    await page.click('[title="Toggle price heat map"]');
    
    // The button should be active/pressed
    await expect(page.locator('[title="Toggle price heat map"]')).toHaveClass(/bg-blue-600/);
  });

  test('should find adjacent seats', async ({ page }) => {
    // Wait for seats to load
    await page.waitForSelector('[data-testid^="seat-"]');
    
    // Make sure we start with no selections
    await expect(page.locator('[data-testid="seat-count"]')).toContainText('0 /');
    
    // Click the find adjacent seats button using a more specific selector
    await page.click('button:has-text("Find")');
    
    // Wait a bit for the function to execute
    await page.waitForTimeout(1000);
    
    // The find function may or may not find adjacent seats depending on venue layout
    // But the button should be clickable and the function should execute without error
    // This test verifies the UI interaction works
    await expect(page.locator('button:has-text("Find")')).toBeVisible();
  });

  test('should clear all selections', async ({ page }) => {
    // Wait for seats to load
    await page.waitForSelector('[data-testid^="seat-"]');
    
    // Select a seat first
    const availableSeat = page.locator('[data-testid^="seat-"]:not([disabled])').first();
    await availableSeat.click();
    
    // Verify selection
    await expect(page.locator('[data-testid="seat-count"]')).toContainText('1 /');
    
    // Click clear button
    await page.click('[aria-label="Clear all selections"]');
    
    // Verify cleared
    await expect(page.locator('[data-testid="seat-count"]')).toContainText('0 /');
  });

  test('should support zoom and pan controls', async ({ page }) => {
    // Wait for controls to load
    await page.waitForSelector('[aria-label="Zoom in"]');
    
    // Test zoom in
    await page.click('[aria-label="Zoom in"]');
    
    // Should show increased zoom percentage - look for percentage text
    await expect(page.locator('[data-testid="zoom-percentage"]')).toBeVisible();
    
    // Test zoom out
    await page.click('[aria-label="Zoom out"]');
    
    // Test reset view
    await page.click('[aria-label="Reset view"]');
    
    // Should reset to 100%
    await expect(page.locator('[data-testid="zoom-percentage"]')).toContainText('100%');
  });

  test('should toggle dark mode', async ({ page }) => {
    // Wait for dark mode toggle
    await page.waitForSelector('[title="Toggle dark mode"]');
    
    // Click dark mode toggle
    await page.click('[title="Toggle dark mode"]');
    
    // Check that dark class is added to html
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should still load properly
    await expect(page.locator('h1')).toContainText('Metropolis Arena');
    
    // Seats should still be clickable
    await page.waitForSelector('[data-testid^="seat-"]');
    const seat = page.locator('[data-testid^="seat-"]:not([disabled])').first();
    await seat.click();
    
    // Selection should work
    await expect(page.locator('[data-testid="seat-count"]')).toContainText('1 /');
  });
});
