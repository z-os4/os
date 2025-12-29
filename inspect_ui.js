import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'inspection_screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function inspectUI() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('=== ZOS Desktop UI Inspection ===\n');

  try {
    // 1. INITIAL LOAD
    console.log('1. INITIAL LOAD TEST');
    console.log('Navigating to http://localhost:5173/...');

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for any rendering

    await page.screenshot({ path: `${screenshotsDir}/01_initial_load.png`, fullPage: true });
    console.log('✓ Screenshot: 01_initial_load.png');

    // Check for key elements
    const menuBar = await page.locator('[class*="menu"], [class*="bar"], header').first();
    const dock = await page.locator('[class*="dock"], [class*="taskbar"], footer').first();

    console.log('Checking for menu bar...');
    try {
      await page.waitForSelector('[class*="menu"], [class*="bar"], header', { timeout: 5000 });
      console.log('✓ Menu bar found');
    } catch (e) {
      console.log('⚠ Menu bar not found with expected selectors');
    }

    console.log('Checking for dock...');
    try {
      await page.waitForSelector('[class*="dock"], [class*="taskbar"], footer', { timeout: 5000 });
      console.log('✓ Dock found');
    } catch (e) {
      console.log('⚠ Dock not found with expected selectors');
    }

    // 2. WINDOW TESTING - Finder
    console.log('\n2. WINDOW TESTING');
    console.log('Testing Finder app...');

    // Look for app icons in dock
    const appIcons = await page.locator('[class*="icon"], [class*="app"], button').all();
    console.log(`Found ${appIcons.length} potential clickable elements`);

    // Try to find and click Finder icon
    const finderButton = await page.locator('text=/Finder|finder/i').first();
    if (await finderButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✓ Found Finder app');
      await finderButton.click();
      await page.waitForTimeout(2000); // Wait for window to open
      await page.screenshot({ path: `${screenshotsDir}/02_finder_opened.png`, fullPage: true });
      console.log('✓ Finder window opened');
      console.log('✓ Screenshot: 02_finder_opened.png');
    } else {
      console.log('⚠ Could not find Finder button with text selector');
      // Try clicking first dock icon
      const firstDockIcon = await page.locator('[class*="dock"] button, [class*="dock"] [class*="icon"]').first();
      if (await firstDockIcon.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('Clicking first dock icon...');
        await firstDockIcon.click();
        await page.waitForTimeout(2500);
        await page.screenshot({ path: `${screenshotsDir}/02_first_app_opened.png`, fullPage: true });
        console.log('✓ First app window opened');
        console.log('✓ Screenshot: 02_first_app_opened.png');
      }
    }

    // 3. TEST CALCULATOR
    console.log('\nTesting Calculator app...');
    const calcButton = await page.locator('text=/Calculator|calc/i').first();
    if (await calcButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✓ Found Calculator app');
      await calcButton.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `${screenshotsDir}/03_calculator_opened.png`, fullPage: true });
      console.log('✓ Calculator window opened');
      console.log('✓ Screenshot: 03_calculator_opened.png');
    } else {
      console.log('⚠ Could not find Calculator app');
    }

    // 4. WINDOW MANAGEMENT - Test dragging
    console.log('\n3. WINDOW MANAGEMENT TEST');
    console.log('Testing window dragging...');

    const windowTitleBar = await page.locator('[class*="window"], [class*="title"]').first();
    if (await windowTitleBar.isVisible({ timeout: 2000 }).catch(() => false)) {
      const box = await windowTitleBar.boundingBox();
      if (box) {
        console.log(`Window title bar position: x=${box.x}, y=${box.y}`);
        // Simulate drag
        await page.mouse.move(box.x + box.width / 2, box.y + 20);
        await page.mouse.down();
        await page.mouse.move(box.x + 100, box.y + 50);
        await page.mouse.up();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${screenshotsDir}/04_window_dragged.png`, fullPage: true });
        console.log('✓ Window drag tested');
        console.log('✓ Screenshot: 04_window_dragged.png');
      }
    } else {
      console.log('⚠ Could not find window to drag');
    }

    // 5. CLOSE WINDOW - Test red traffic light button
    console.log('Testing window close (red traffic light)...');
    const closeButton = await page.locator('button[title*="Close"], button[aria-label*="close"], [class*="close"]').first();
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotsDir}/05_window_closed.png`, fullPage: true });
      console.log('✓ Window closed');
      console.log('✓ Screenshot: 05_window_closed.png');
    } else {
      console.log('⚠ Could not find close button');
    }

    // 6. OPEN MULTIPLE WINDOWS
    console.log('\nTesting multiple windows...');

    // Open 2-3 more windows
    const dockIcons = await page.locator('[class*="dock"] button, [class*="dock"] [role="button"]').all();
    console.log(`Found ${dockIcons.length} dock icons`);

    if (dockIcons.length > 1) {
      for (let i = 0; i < Math.min(2, dockIcons.length); i++) {
        try {
          await dockIcons[i].click();
          await page.waitForTimeout(2000);
        } catch (e) {
          console.log(`Could not click dock icon ${i}: ${e.message}`);
        }
      }
      await page.screenshot({ path: `${screenshotsDir}/06_multiple_windows.png`, fullPage: true });
      console.log('✓ Multiple windows opened');
      console.log('✓ Screenshot: 06_multiple_windows.png');
    }

    // 7. CONSOLE ERRORS
    console.log('\n4. CONSOLE INSPECTION');
    const consoleMessages = [];
    const consoleErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        const record = { type: msg.type(), text: msg.text() };
        if (msg.type() === 'error') {
          consoleErrors.push(record);
        } else {
          consoleMessages.push(record);
        }
      }
    });

    // 8. LAZY LOADING CHECK
    console.log('\n5. LAZY LOADING CHECK');
    await page.reload();
    await page.waitForTimeout(1000);

    // Look for loading spinners
    const spinners = await page.locator('[class*="spin"], [class*="load"], [class*="skeleton"]').all();
    console.log(`Spinner elements found: ${spinners.length}`);

    if (spinners.length > 0) {
      await page.screenshot({ path: `${screenshotsDir}/07_lazy_loading.png`, fullPage: true });
      console.log('✓ Lazy loading spinners visible');
      console.log('✓ Screenshot: 07_lazy_loading.png');
    }

    // Wait for page to fully load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screenshotsDir}/08_fully_loaded.png`, fullPage: true });
    console.log('✓ Fully loaded screenshot taken');

    // 9. FINAL SUMMARY
    console.log('\n=== INSPECTION SUMMARY ===');
    console.log(`Console Errors: ${consoleErrors.length}`);
    consoleErrors.forEach(e => console.log(`  - ${e.type}: ${e.text}`));

    console.log(`Console Warnings: ${consoleMessages.length}`);
    consoleMessages.slice(0, 5).forEach(m => console.log(`  - ${m.type}: ${m.text}`));

    console.log('\nScreenshots saved to: ' + screenshotsDir);

  } catch (error) {
    console.error('\nERROR during inspection:', error.message);
    await page.screenshot({ path: `${screenshotsDir}/ERROR_screenshot.png`, fullPage: true });
  } finally {
    await browser.close();
    console.log('\nInspection complete!');
  }
}

inspectUI().catch(console.error);
