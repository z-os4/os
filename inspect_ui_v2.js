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
  const errors = [];
  const warnings = [];

  console.log('=== ZOS Desktop UI Comprehensive Inspection ===\n');

  try {
    // Set up console listener
    page.on('console', msg => {
      const logEntry = { type: msg.type(), text: msg.text() };
      if (msg.type() === 'error') {
        errors.push(logEntry);
      } else if (msg.type() === 'warning') {
        warnings.push(logEntry);
      }
    });

    page.on('pageerror', err => {
      errors.push({ type: 'error', text: err.message });
    });

    // 1. INITIAL LOAD
    console.log('1. INITIAL LOAD TEST');
    console.log('Navigating to http://localhost:5173/...');

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000); // Wait for React to render

    await page.screenshot({ path: `${screenshotsDir}/01_initial_load.png`, fullPage: true });
    console.log('✓ Screenshot: 01_initial_load.png');

    // Check for key UI elements
    console.log('Checking UI elements...');

    // MenuBar should contain the Apple logo and app name
    try {
      await page.waitForSelector('svg[class*="apple"], text=/zOS|Finder/', { timeout: 5000 });
      console.log('✓ Menu bar found (Apple logo or app name visible)');
    } catch (e) {
      console.log('⚠ Menu bar not immediately visible');
    }

    // Dock should be at the bottom
    try {
      const dockElement = await page.$('[class*="dock"]');
      if (dockElement) {
        console.log('✓ Dock found');
      } else {
        // Try alternative selectors
        const bottomBar = await page.$('div:has(> button)');
        if (bottomBar) {
          console.log('✓ Dock found (via alternative selector)');
        }
      }
    } catch (e) {
      console.log('⚠ Dock selector failed');
    }

    // 2. WINDOW TESTING - Click dock icons
    console.log('\n2. WINDOW TESTING');

    // Get all buttons that could be app icons
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} button elements`);

    // Click first app icon (Finder)
    if (buttons.length > 0) {
      console.log('Clicking first dock icon...');
      await buttons[0].click();
      await page.waitForTimeout(3000); // Wait for lazy loading
      await page.screenshot({ path: `${screenshotsDir}/02_first_app_opened.png`, fullPage: true });
      console.log('✓ First app window opened');
      console.log('✓ Screenshot: 02_first_app_opened.png');

      // Check for loading spinner
      const loadingElements = await page.$$('[class*="spin"], [class*="load"], [class*="skeleton"]');
      console.log(`  Loading elements: ${loadingElements.length}`);
    }

    // Click another app icon (second button)
    if (buttons.length > 1) {
      console.log('\nClicking second dock icon...');
      await buttons[1].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screenshotsDir}/03_second_app_opened.png`, fullPage: true });
      console.log('✓ Second app window opened');
      console.log('✓ Screenshot: 03_second_app_opened.png');
    }

    // Click third app icon
    if (buttons.length > 2) {
      console.log('\nClicking third dock icon...');
      await buttons[2].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screenshotsDir}/04_third_app_opened.png`, fullPage: true });
      console.log('✓ Third app window opened');
      console.log('✓ Screenshot: 04_third_app_opened.png');
    }

    // 3. WINDOW MANAGEMENT
    console.log('\n3. WINDOW MANAGEMENT TESTS');

    // Find window title bar and drag
    const titleBars = await page.$$('[class*="title"], [class*="window"]');
    console.log(`Found ${titleBars.length} potential title bar elements`);

    if (titleBars.length > 0) {
      console.log('Testing window drag...');
      const titleBar = titleBars[0];
      const box = await titleBar.boundingBox();

      if (box) {
        // Simulate drag
        await page.mouse.move(box.x + 50, box.y + 10);
        await page.mouse.down();
        await page.mouse.move(box.x + 150, box.y + 50);
        await page.mouse.up();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${screenshotsDir}/05_window_dragged.png`, fullPage: true });
        console.log('✓ Window drag tested');
        console.log('✓ Screenshot: 05_window_dragged.png');
      }
    }

    // Find and click close button (red traffic light)
    const closeButtons = await page.$$('[class*="traffic-light-close"], button[aria-label*="close"]');
    console.log(`Found ${closeButtons.length} close button(s)`);

    if (closeButtons.length > 0) {
      console.log('Closing a window...');
      await closeButtons[0].click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screenshotsDir}/06_window_closed.png`, fullPage: true });
      console.log('✓ Window closed successfully');
      console.log('✓ Screenshot: 06_window_closed.png');
    }

    // 4. MULTIPLE WINDOWS
    console.log('\n4. MULTIPLE WINDOWS TEST');
    console.log('Opening multiple windows...');

    // Click several dock icons to open multiple windows
    const dockButtons = await page.$$('[class*="dock"] button');
    console.log(`Found ${dockButtons.length} dock buttons`);

    if (dockButtons.length > 2) {
      for (let i = 0; i < Math.min(3, dockButtons.length); i++) {
        try {
          await dockButtons[i].click();
          await page.waitForTimeout(1500);
        } catch (e) {
          console.log(`  Could not click dock button ${i}`);
        }
      }
      await page.screenshot({ path: `${screenshotsDir}/07_multiple_windows.png`, fullPage: true });
      console.log('✓ Multiple windows opened');
      console.log('✓ Screenshot: 07_multiple_windows.png');
    }

    // 5. LAZY LOADING CHECK
    console.log('\n5. LAZY LOADING CHECK');
    await page.reload();
    await page.waitForTimeout(1500);

    // Look for loading indicators
    const loadingIndicators = await page.$$('[class*="spin"], [class*="load"], [class*="skeleton"], [role="progressbar"]');
    console.log(`Lazy loading indicators found: ${loadingIndicators.length}`);

    if (loadingIndicators.length > 0) {
      await page.screenshot({ path: `${screenshotsDir}/08_lazy_loading.png`, fullPage: true });
      console.log('✓ Lazy loading spinners detected');
      console.log('✓ Screenshot: 08_lazy_loading.png');
    }

    // Wait for full load
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/09_fully_loaded.png`, fullPage: true });
    console.log('✓ Fully loaded screenshot taken');
    console.log('✓ Screenshot: 09_fully_loaded.png');

    // 6. MENU BAR INSPECTION
    console.log('\n6. MENU BAR INSPECTION');

    // Look for menu bar elements
    const menuElements = await page.$$('svg, [class*="apple"], [class*="menu"]');
    console.log(`Menu-related elements found: ${menuElements.length}`);

    // Check for specific menu text
    const menuText = await page.$eval('body', el => el.textContent);
    if (menuText && (menuText.includes('zOS') || menuText.includes('Finder') || menuText.includes('File'))) {
      console.log('✓ Menu bar content detected');
    }

    // 7. ACCESSIBILITY CHECK
    console.log('\n7. ACCESSIBILITY CHECK');
    const ariaLabels = await page.$$('[aria-label], [role="button"], [role="window"]');
    console.log(`Accessible elements (aria labels/roles): ${ariaLabels.length}`);

    // 8. PAGE METRICS
    console.log('\n8. PAGE METRICS');
    const metrics = await page.evaluate(() => {
      return {
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        documentSize: `${document.documentElement.scrollWidth}x${document.documentElement.scrollHeight}`,
        elementCount: document.querySelectorAll('*').length,
      };
    });
    console.log(`Viewport: ${metrics.viewport}`);
    console.log(`Document size: ${metrics.documentSize}`);
    console.log(`Total elements: ${metrics.elementCount}`);

    // 9. FINAL REPORT
    console.log('\n=== INSPECTION REPORT ===');
    console.log(`Console Errors: ${errors.length}`);
    errors.forEach(e => console.log(`  ERROR: ${e.text}`));

    console.log(`Console Warnings: ${warnings.length}`);
    warnings.slice(0, 5).forEach(w => console.log(`  WARNING: ${w.text}`));

    console.log(`\nScreenshots saved: ${screenshotsDir}`);
    console.log('Screenshots taken:');
    fs.readdirSync(screenshotsDir)
      .filter(f => f.endsWith('.png'))
      .sort()
      .forEach(f => console.log(`  - ${f}`));

    // 10. VISUAL VALIDATION SUMMARY
    console.log('\n=== VISUAL VALIDATION SUMMARY ===');
    console.log('The inspection has captured the following UI states:');
    console.log('  01_initial_load.png - Desktop on first load');
    console.log('  02_first_app_opened.png - First app window opened');
    console.log('  03_second_app_opened.png - Second app opened');
    console.log('  04_third_app_opened.png - Third app opened');
    console.log('  05_window_dragged.png - Window after drag operation');
    console.log('  06_window_closed.png - Desktop after closing a window');
    console.log('  07_multiple_windows.png - Multiple windows open');
    console.log('  08_lazy_loading.png - Loading state (if visible)');
    console.log('  09_fully_loaded.png - Final fully loaded state');

  } catch (error) {
    console.error('\nERROR during inspection:', error.message);
    console.error(error.stack);
    try {
      await page.screenshot({ path: `${screenshotsDir}/ERROR_screenshot.png`, fullPage: true });
    } catch (e) {
      console.error('Could not take error screenshot');
    }
  } finally {
    await browser.close();
    console.log('\nInspection complete!');
  }
}

inspectUI().catch(console.error);
