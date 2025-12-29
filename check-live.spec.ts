import { test } from '@playwright/test';

test('check live site', async ({ page }) => {
  console.log('🔍 Checking https://z-os4.github.io/os/');

  await page.goto('https://z-os4.github.io/os/');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/zos-live-1-initial.png' });
  console.log('📸 Initial load');

  // Check for errors
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/tmp/zos-live-2-after5s.png' });
  console.log('📸 After 5s');

  // Try pressing Enter to skip boot
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/zos-live-3-afterenter.png' });
  console.log('📸 After Enter');

  if (errors.length > 0) {
    console.log('❌ Errors found:');
    errors.forEach(e => console.log('  ', e));
  } else {
    console.log('✅ No JS errors');
  }
});
