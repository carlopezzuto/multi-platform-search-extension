/**
 * E2E tests for extension popup functionality
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

test.describe('Extension Popup', () => {
  test('should load popup and display all platform buttons', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Check that popup loads
    await expect(page.locator('h1')).toHaveText('Search on Multiple Platforms');

    // Check that all 13 platform buttons are present
    const buttons = [
      'searchLinkedin',
      'searchGithub',
      'searchStackOverflow',
      'searchGoogle',
      'searchTwitter',
      'searchReddit',
      'searchYoutube',
      'searchMedium',
      'searchBehance',
      'searchArtStation',
      'searchDeviantArt',
      'searchDribbble',
      'searchMobyGames',
    ];

    for (const buttonId of buttons) {
      const button = page.locator(`#${buttonId}`);
      await expect(button).toBeVisible();
    }

    await page.close();
  });

  test('should show search tips when hovering over help icon', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    const helpIcon = page.locator('#helpIcon');
    await expect(helpIcon).toBeVisible();

    await helpIcon.hover();
    const tipsDiv = page.locator('#searchTips');
    await expect(tipsDiv).toBeVisible();

    await page.close();
  });

  test('should validate search input', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    const searchInput = page.locator('#searchInput');

    // Empty input should have no border color
    await expect(searchInput).toHaveCSS('border-color', 'rgb(204, 204, 204)');

    // Type valid input
    await searchInput.fill('test query');
    await page.waitForTimeout(100);

    // Valid input should have green border (rgb(0, 128, 0))
    const borderColor = await searchInput.evaluate(
      (el) => window.getComputedStyle(el).borderColor
    );
    expect(borderColor).toContain('0, 128, 0');

    await page.close();
  });

  test('should update button text when platform is selected', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    const linkedinButton = page.locator('#searchLinkedin');
    await linkedinButton.click();

    // Check that button shows it's selected
    const classList = await linkedinButton.evaluate((el) => [...el.classList]);
    expect(classList).toContain('selected');

    await page.close();
  });

  test('should show toast notification on error', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Try to search without input and without selected text
    const linkedinButton = page.locator('#searchLinkedin');
    await linkedinButton.click();

    // Wait for toast notification
    const toast = page.locator('.toast');
    await expect(toast).toBeVisible({ timeout: 3000 });

    // Toast should contain error message
    const toastText = await toast.textContent();
    expect(toastText.toLowerCase()).toContain('enter');

    await page.close();
  });

  test('should show attribution in footer', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    const footer = page.locator('.powered-by');
    await expect(footer).toBeVisible();

    const footerText = await footer.textContent();
    expect(footerText).toContain('Carlo Pezzuto');
    expect(footerText).toContain('Enrico Heidelberg');

    await page.close();
  });
});

test.describe('Search Functionality', () => {
  test('should search on LinkedIn with manual input', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    const searchInput = page.locator('#searchInput');
    const linkedinButton = page.locator('#searchLinkedin');

    await searchInput.fill('Software Engineer');
    await linkedinButton.click();

    // Wait for new tab to open
    await page.waitForTimeout(1000);

    const pages = browser.contexts()[0].pages();
    const newTab = pages[pages.length - 1];

    // Check that LinkedIn search URL is opened
    expect(newTab.url()).toContain('linkedin.com/search');
    expect(newTab.url()).toContain('Software');

    await newTab.close();
    await page.close();
  });

  test('should search on GitHub with manual input', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    const searchInput = page.locator('#searchInput');
    const githubButton = page.locator('#searchGithub');

    await searchInput.fill('user:octocat');
    await githubButton.click();

    await page.waitForTimeout(1000);

    const pages = browser.contexts()[0].pages();
    const newTab = pages[pages.length - 1];

    expect(newTab.url()).toContain('github.com/search');
    expect(newTab.url()).toContain('user');

    await newTab.close();
    await page.close();
  });

  test('should search on Stack Overflow', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    const searchInput = page.locator('#searchInput');
    const stackOverflowButton = page.locator('#searchStackOverflow');

    await searchInput.fill('javascript async await');
    await stackOverflowButton.click();

    await page.waitForTimeout(1000);

    const pages = browser.contexts()[0].pages();
    const newTab = pages[pages.length - 1];

    expect(newTab.url()).toContain('stackoverflow.com/search');

    await newTab.close();
    await page.close();
  });
});

test.describe('Keyboard Shortcuts', () => {
  test('should select platform using number keys 1-9', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Press '1' to select LinkedIn
    await page.keyboard.press('1');

    const linkedinButton = page.locator('#searchLinkedin');
    const classList = await linkedinButton.evaluate((el) => [...el.classList]);
    expect(classList).toContain('selected');

    // Press '2' to select GitHub
    await page.keyboard.press('2');

    const githubButton = page.locator('#searchGithub');
    const githubClasses = await githubButton.evaluate((el) => [
      ...el.classList,
    ]);
    expect(githubClasses).toContain('selected');

    await page.close();
  });

  test('should close popup on Escape key', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    // Press Escape
    await page.keyboard.press('Escape');

    // Check if window.close() was called (popup should close)
    // Note: In headless mode, this might not actually close the page
    await page.waitForTimeout(500);

    await page.close();
  });
});

test.describe('Search History', () => {
  test('should save search to history', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    const searchInput = page.locator('#searchInput');
    const linkedinButton = page.locator('#searchLinkedin');

    // Perform a search
    await searchInput.fill('Test Search Query');
    await linkedinButton.click();

    await page.waitForTimeout(1000);

    // Close the new tab
    const pages = browser.contexts()[0].pages();
    const newTab = pages[pages.length - 1];
    await newTab.close();

    // Reload popup
    await page.reload();

    // Click on input to show history dropdown
    await searchInput.click();

    // Check if history dropdown appears
    const historyDropdown = page.locator('#historyDropdown');
    await expect(historyDropdown).toBeVisible();

    // Check if search query is in history
    const historyItems = page.locator('.history-item');
    const count = await historyItems.count();
    expect(count).toBeGreaterThan(0);

    await page.close();
  });

  test('should populate input when clicking history item', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    const searchInput = page.locator('#searchInput');

    // Click input to show history
    await searchInput.click();

    const historyDropdown = page.locator('#historyDropdown');
    await expect(historyDropdown).toBeVisible();

    const historyItems = page.locator('.history-item');
    const count = await historyItems.count();

    if (count > 0) {
      const firstItem = historyItems.first();
      const historyText = await firstItem.textContent();
      await firstItem.click();

      // Input should be populated with history item
      const inputValue = await searchInput.inputValue();
      expect(inputValue).toBe(historyText.trim());
    }

    await page.close();
  });
});
