/**
 * Automated Screenshot Capture for zOS Apps
 *
 * Uses Playwright to capture screenshots of all apps running in the zOS shell.
 *
 * Usage:
 *   npx tsx scripts/capture-all-screenshots.ts
 *
 * Prerequisites:
 *   - pnpm dev running (zOS shell at http://localhost:5173)
 *   - npx playwright install chromium
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const ZOS_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = '../zos-apps';

// Apps to capture with their window triggers
const APPS_TO_CAPTURE = [
  { id: 'calculator', name: 'Calculator', screenshots: ['main', 'scientific'] },
  { id: 'notes', name: 'Notes', screenshots: ['editor', 'sidebar'] },
  { id: 'clock', name: 'Clock', screenshots: ['main', 'timer', 'stopwatch'] },
  { id: 'weather', name: 'Weather', screenshots: ['main', 'forecast'] },
  { id: 'calendar', name: 'Calendar', screenshots: ['month', 'week', 'day'] },
  { id: 'reminders', name: 'Reminders', screenshots: ['main', 'lists'] },
  { id: 'terminal', name: 'Terminal', screenshots: ['main', 'split'] },
  { id: 'safari', name: 'Safari', screenshots: ['main', 'tabs'] },
  { id: 'finder', name: 'Finder', screenshots: ['main', 'columns', 'preview'] },
  { id: 'music', name: 'Music', screenshots: ['player', 'playlist'] },
  { id: 'photos', name: 'Photos', screenshots: ['gallery', 'detail'] },
  { id: 'mail', name: 'Mail', screenshots: ['inbox', 'compose'] },
  { id: 'messages', name: 'Messages', screenshots: ['chat', 'list'] },
  { id: 'settings', name: 'System Preferences', screenshots: ['main', 'appearance'] },
  { id: 'hanzo-ai', name: 'Hanzo AI', screenshots: ['chat', 'code'] },
  { id: 'stickies', name: 'Stickies', screenshots: ['main', 'colors'] },
];

async function captureScreenshot(
  page: Page,
  appId: string,
  screenshotName: string
): Promise<void> {
  const outputDir = path.join(SCREENSHOT_DIR, appId, 'screenshots');

  // Create directory if needed
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${screenshotName}.png`);

  // Capture the window element
  const windowSelector = '.glass-window, [class*="Window"]';
  const windowElement = await page.$(windowSelector);

  if (windowElement) {
    await windowElement.screenshot({
      path: outputPath,
      type: 'png',
    });
    console.log(`  ✅ ${appId}/${screenshotName}.png`);
  } else {
    // Fallback to viewport screenshot
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 100, y: 50, width: 1280, height: 800 },
    });
    console.log(`  ✅ ${appId}/${screenshotName}.png (viewport)`);
  }
}

async function openApp(page: Page, appName: string): Promise<void> {
  // Open Spotlight with Cmd+Space
  await page.keyboard.press('Meta+Space');
  await page.waitForTimeout(300);

  // Type app name
  await page.keyboard.type(appName);
  await page.waitForTimeout(200);

  // Press Enter to open
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
}

async function closeApp(page: Page): Promise<void> {
  // Close window with Cmd+W
  await page.keyboard.press('Meta+w');
  await page.waitForTimeout(200);
}

async function main() {
  console.log('🚀 Starting automated screenshot capture...\n');

  const browser = await chromium.launch({
    headless: false, // Need to see the UI
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  try {
    // Navigate to zOS
    await page.goto(ZOS_URL);
    await page.waitForTimeout(2000); // Wait for shell to load

    console.log('📸 Capturing screenshots...\n');

    for (const app of APPS_TO_CAPTURE) {
      console.log(`\n📱 ${app.name}`);

      try {
        // Open the app
        await openApp(page, app.name);
        await page.waitForTimeout(500);

        // Capture first screenshot
        await captureScreenshot(page, app.id, app.screenshots[0]);

        // Close app
        await closeApp(page);
      } catch (error) {
        console.log(`  ❌ Failed: ${error}`);
      }
    }

    console.log('\n✨ Screenshot capture complete!');
    console.log('\nNext steps:');
    console.log('1. Review screenshots in ../zos-apps/*/screenshots/');
    console.log('2. Update each app\'s package.json with screenshot config');
    console.log('3. Commit and push to zos-apps repos');

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
