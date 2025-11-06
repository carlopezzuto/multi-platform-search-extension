/**
 * E2E tests for extension options page functionality
 */

const { test, expect, chromium } = require('@playwright/test');
const path = require('path');

let browser;
let context;
let extensionId;

test.beforeAll(async () => {
  // Launch browser with extension loaded
  const pathToExtension = path.join(__dirname, '../../');
  browser = await chromium.launchPersistentContext('', {
    headless: false, // Chrome extensions require non-headless mode
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  // Get extension ID
  let [background] = browser.serviceWorkers();
  if (!background) {
    background = await browser.waitForEvent('serviceworker');
  }

  extensionId = background.url().split('/')[2];
  console.log('Extension ID:', extensionId);
});

test.afterAll(async () => {
  await browser.close();
});

test.describe('Options Page - UI', () => {
  test('should load options page with all sections', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    // Check title
    await expect(page.locator('h1')).toHaveText(
      'Multi-Platform Search Extension - Settings'
    );

    // Check that all main sections are present
    await expect(
      page.locator('h2:has-text("Platform Management")')
    ).toBeVisible();
    await expect(page.locator('h2:has-text("General Settings")')).toBeVisible();
    await expect(
      page.locator('h2:has-text("Import/Export Settings")')
    ).toBeVisible();

    await page.close();
  });

  test('should display all 13 platforms', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    const platformItems = page.locator('.platform-item');
    const count = await platformItems.count();
    expect(count).toBe(13);

    await page.close();
  });

  test('should show enable/disable toggles for each platform', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    const checkboxes = page.locator('input[type="checkbox"][id^="enable-"]');
    const count = await checkboxes.count();
    expect(count).toBe(13);

    await page.close();
  });
});

test.describe('Options Page - Platform Management', () => {
  test('should toggle platform enable/disable', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    const linkedinCheckbox = page.locator('#enable-Linkedin');
    const initialState = await linkedinCheckbox.isChecked();

    // Toggle the checkbox
    await linkedinCheckbox.click();
    await page.waitForTimeout(500);

    // Check that state changed
    const newState = await linkedinCheckbox.isChecked();
    expect(newState).toBe(!initialState);

    // Toggle back
    await linkedinCheckbox.click();
    await page.waitForTimeout(500);

    await page.close();
  });

  test('should support drag and drop for reordering platforms', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    const platformItems = page.locator('.platform-item');
    const firstPlatform = platformItems.first();
    const secondPlatform = platformItems.nth(1);

    const firstPlatformText = await firstPlatform
      .locator('.platform-name')
      .textContent();
    const secondPlatformText = await secondPlatform
      .locator('.platform-name')
      .textContent();

    // Perform drag and drop
    await firstPlatform.dragTo(secondPlatform);
    await page.waitForTimeout(500);

    // Check that order changed
    const newFirstPlatform = platformItems.first();
    const newFirstText = await newFirstPlatform
      .locator('.platform-name')
      .textContent();

    // The first platform should now be different
    expect(newFirstText).not.toBe(firstPlatformText);

    await page.close();
  });
});

test.describe('Options Page - General Settings', () => {
  test('should toggle search history setting', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    const historyCheckbox = page.locator('#searchHistory');
    const initialState = await historyCheckbox.isChecked();

    await historyCheckbox.click();
    await page.waitForTimeout(500);

    const newState = await historyCheckbox.isChecked();
    expect(newState).toBe(!initialState);

    // Toggle back to original state
    await historyCheckbox.click();
    await page.waitForTimeout(500);

    await page.close();
  });

  test('should toggle keyboard shortcuts setting', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    const shortcutsCheckbox = page.locator('#keyboardShortcuts');
    const initialState = await shortcutsCheckbox.isChecked();

    await shortcutsCheckbox.click();
    await page.waitForTimeout(500);

    const newState = await shortcutsCheckbox.isChecked();
    expect(newState).toBe(!initialState);

    // Toggle back
    await shortcutsCheckbox.click();
    await page.waitForTimeout(500);

    await page.close();
  });

  test('should adjust max history entries slider', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    const historySlider = page.locator('#maxHistoryEntries');
    const initialValue = await historySlider.inputValue();

    // Change slider value
    await historySlider.fill('50');
    await page.waitForTimeout(500);

    const newValue = await historySlider.inputValue();
    expect(newValue).toBe('50');

    await page.close();
  });
});

test.describe('Options Page - Import/Export', () => {
  test('should export settings', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    const exportButton = page.locator('#exportSettings');
    await expect(exportButton).toBeVisible();

    // Note: Testing actual download would require more complex setup
    // We're just checking that the button exists and is clickable
    await expect(exportButton).toBeEnabled();

    await page.close();
  });

  test('should show import button', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    const importButton = page.locator('#importSettings');
    await expect(importButton).toBeVisible();
    await expect(importButton).toBeEnabled();

    await page.close();
  });

  test('should show reset button', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    const resetButton = page.locator('#resetSettings');
    await expect(resetButton).toBeVisible();
    await expect(resetButton).toBeEnabled();

    await page.close();
  });
});

test.describe('Options Page - Save Functionality', () => {
  test('should show toast notification when settings are saved', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    // Make a change
    const historyCheckbox = page.locator('#searchHistory');
    await historyCheckbox.click();

    // Look for toast notification
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible({ timeout: 3000 });

    const toastText = await toast.textContent();
    expect(toastText.toLowerCase()).toContain('saved');

    // Revert change
    await historyCheckbox.click();
    await page.waitForTimeout(1000);

    await page.close();
  });
});

test.describe('Options Page - Persistence', () => {
  test('should persist settings across page reloads', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/options.html`);

    // Get initial state
    const historyCheckbox = page.locator('#searchHistory');
    const initialState = await historyCheckbox.isChecked();

    // Change setting
    await historyCheckbox.click();
    await page.waitForTimeout(1000);

    // Reload page
    await page.reload();
    await page.waitForTimeout(1000);

    // Check that setting persisted
    const newState = await historyCheckbox.isChecked();
    expect(newState).toBe(!initialState);

    // Revert setting
    await historyCheckbox.click();
    await page.waitForTimeout(1000);

    await page.close();
  });
});
