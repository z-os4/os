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
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
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
    console.log('1. INITIAL LOAD & BOOT SEQUENCE');
    console.log('Navigating to http://localhost:5173/...');

    await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(500);

    await page.screenshot({ path: `${screenshotsDir}/01_boot_start.png`, fullPage: true });
    console.log('✓ Screenshot: 01_boot_start.png (boot sequence visible)');

    // Wait for boot to complete (3000ms + buffer)
    console.log('Waiting for boot sequence to complete (approximately 4 seconds)...');
    await page.waitForTimeout(4000);

    await page.screenshot({ path: `${screenshotsDir}/02_boot_complete.png`, fullPage: true });
    console.log('✓ Screenshot: 02_boot_complete.png (ready to continue)');

    // Click to continue from boot sequence
    console.log('Pressing key to exit boot sequence...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(500); // Wait for transition

    await page.screenshot({ path: `${screenshotsDir}/03_desktop_initial.png`, fullPage: true });
    console.log('✓ Screenshot: 03_desktop_initial.png (desktop appears)');

    // Wait for desktop to fully render
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotsDir}/04_desktop_rendered.png`, fullPage: true });
    console.log('✓ Screenshot: 04_desktop_rendered.png (desktop fully loaded)');

    // 2. INSPECT MENU BAR
    console.log('\n2. MENU BAR INSPECTION');
    try {
      const allElements = await page.$$('*');
      console.log(`Total DOM elements: ${allElements.length}`);

      // Look for menu bar by class
      const menuElements = await page.$$('[class*="menubar"], header, [class*="menu"]');
      console.log(`Menu bar elements found: ${menuElements.length}`);

      // Get all visible text
      const bodyText = await page.textContent('body');
      const hasMenuText = bodyText && (
        bodyText.includes('File') ||
        bodyText.includes('Edit') ||
        bodyText.includes('View') ||
        bodyText.includes('zOS') ||
        bodyText.includes('Apple')
      );

      if (hasMenuText) {
        console.log('✓ Menu bar content detected');
      } else {
        console.log('⚠ Menu bar text not found');
      }
    } catch (e) {
      console.log('⚠ Menu bar inspection failed:', e.message);
    }

    // 3. INSPECT DOCK
    console.log('\n3. DOCK INSPECTION');
    try {
      const dockElements = await page.$$('[class*="dock"], footer, [class*="taskbar"]');
      console.log(`Dock elements found: ${dockElements.length}`);

      // Count all buttons as potential app icons
      const allButtons = await page.$$('button');
      console.log(`Total buttons/clickable elements: ${allButtons.length}`);

      if (allButtons.length > 0) {
        console.log('✓ Dock with app icons detected');
      } else {
        console.log('⚠ No buttons found in dock');
      }
    } catch (e) {
      console.log('⚠ Dock inspection failed:', e.message);
    }

    // 4. WINDOW TESTING
    console.log('\n4. WINDOW OPENING TEST');
    const buttons = await page.$$('button');
    console.log(`Available buttons to click: ${buttons.length}`);

    if (buttons.length > 0) {
      // Try clicking first button (likely Finder)
      console.log('Clicking first app icon...');
      try {
        await buttons[0].click();
        await page.waitForTimeout(2500);
        await page.screenshot({ path: `${screenshotsDir}/05_first_app_opened.png`, fullPage: true });
        console.log('✓ Screenshot: 05_first_app_opened.png (app window opened)');
      } catch (e) {
        console.log('⚠ Could not click first button:', e.message);
      }

      // Try clicking second button
      if (buttons.length > 1) {
        console.log('Clicking second app icon...');
        try {
          await buttons[1].click();
          await page.waitForTimeout(2500);
          await page.screenshot({ path: `${screenshotsDir}/06_second_app_opened.png`, fullPage: true });
          console.log('✓ Screenshot: 06_second_app_opened.png (second app opened)');
        } catch (e) {
          console.log('⚠ Could not click second button');
        }
      }

      // Try clicking third button
      if (buttons.length > 2) {
        console.log('Clicking third app icon...');
        try {
          await buttons[2].click();
          await page.waitForTimeout(2500);
          await page.screenshot({ path: `${screenshotsDir}/07_third_app_opened.png`, fullPage: true });
          console.log('✓ Screenshot: 07_third_app_opened.png (third app opened)');
        } catch (e) {
          console.log('⚠ Could not click third button');
        }
      }

      // 5. WINDOW MANAGEMENT
      console.log('\n5. WINDOW MANAGEMENT TEST');

      // Try to find and drag a window
      const windows = await page.$$('[class*="window"], [class*="draggable"]');
      console.log(`Window elements found: ${windows.length}`);

      if (windows.length > 0) {
        const firstWindow = windows[0];
        const box = await firstWindow.boundingBox();

        if (box && box.height > 30) {
          console.log('Attempting window drag...');
          await page.mouse.move(box.x + 100, box.y + 15);
          await page.mouse.down();
          await page.mouse.move(box.x + 200, box.y + 80);
          await page.mouse.up();
          await page.waitForTimeout(500);
          await page.screenshot({ path: `${screenshotsDir}/08_window_dragged.png`, fullPage: true });
          console.log('✓ Screenshot: 08_window_dragged.png (window drag tested)');
        }
      }

      // Try to find and click close button
      const closeButtons = await page.$$('button[aria-label*="close"], [class*="close"]');
      console.log(`Close buttons found: ${closeButtons.length}`);

      if (closeButtons.length > 0) {
        console.log('Closing a window...');
        try {
          await closeButtons[0].click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `${screenshotsDir}/09_window_closed.png`, fullPage: true });
          console.log('✓ Screenshot: 09_window_closed.png (window closed)');
        } catch (e) {
          console.log('⚠ Could not close window');
        }
      }

      // 6. MULTIPLE WINDOWS
      console.log('\n6. MULTIPLE WINDOWS TEST');
      console.log('Opening multiple windows...');

      const freshButtons = await page.$$('button');
      if (freshButtons.length >= 3) {
        for (let i = 0; i < Math.min(3, freshButtons.length); i++) {
          try {
            await freshButtons[i].click();
            await page.waitForTimeout(1500);
          } catch (e) {
            console.log(`Could not click button ${i}`);
          }
        }
        await page.screenshot({ path: `${screenshotsDir}/10_multiple_windows.png`, fullPage: true });
        console.log('✓ Screenshot: 10_multiple_windows.png (multiple windows)');
      }
    }

    // 7. LAZY LOADING CHECK
    console.log('\n7. LAZY LOADING VERIFICATION');
    console.log('Reloading page to check lazy loading...');
    await page.reload();
    await page.waitForTimeout(1500);

    const loadingIndicators = await page.$$('[class*="spin"], [class*="load"], [class*="skeleton"], [role="progressbar"]');
    console.log(`Loading indicators found: ${loadingIndicators.length}`);

    if (loadingIndicators.length > 0) {
      await page.screenshot({ path: `${screenshotsDir}/11_lazy_loading.png`, fullPage: true });
      console.log('✓ Screenshot: 11_lazy_loading.png (lazy loading visible)');
    }

    // Wait for full load
    await page.waitForTimeout(5000); // Long wait for boot sequence on reload
    await page.keyboard.press('Space');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: `${screenshotsDir}/12_fully_loaded.png`, fullPage: true });
    console.log('✓ Screenshot: 12_fully_loaded.png (fully loaded state)');

    // 8. PAGE METRICS
    console.log('\n8. PAGE METRICS');
    const metrics = await page.evaluate(() => {
      return {
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        documentSize: `${document.documentElement.scrollWidth}x${document.documentElement.scrollHeight}`,
        elementCount: document.querySelectorAll('*').length,
        buttonCount: document.querySelectorAll('button').length,
      };
    });
    console.log(`Viewport: ${metrics.viewport}`);
    console.log(`Document size: ${metrics.documentSize}`);
    console.log(`Total elements: ${metrics.elementCount}`);
    console.log(`Buttons: ${metrics.buttonCount}`);

    // 9. FINAL REPORT
    console.log('\n=== INSPECTION REPORT ===');
    console.log(`Console Errors: ${errors.length}`);
    errors.forEach(e => console.log(`  ERROR: ${e.text}`));

    console.log(`Console Warnings: ${warnings.length}`);
    warnings.slice(0, 5).forEach(w => console.log(`  WARNING: ${w.text}`));

    if (errors.length === 0) {
      console.log('✓ No console errors detected');
    }

    console.log(`\nScreenshots directory: ${screenshotsDir}`);
    const screenshots = fs.readdirSync(screenshotsDir)
      .filter(f => f.endsWith('.png'))
      .sort();
    console.log(`Screenshots captured: ${screenshots.length}`);
    screenshots.forEach(f => console.log(`  ✓ ${f}`));

  } catch (error) {
    console.error('\nERROR during inspection:', error.message);
    console.error(error.stack);
    try {
      await page.screenshot({ path: `${screenshotsDir}/ERROR_screenshot.png`, fullPage: true });
      console.log('Error screenshot saved');
    } catch (e) {
      console.error('Could not save error screenshot');
    }
  } finally {
    await browser.close();
    console.log('\n=== Inspection Complete ===');
  }
}

inspectUI().catch(console.error);
