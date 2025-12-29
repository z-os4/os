/**
 * Batch update all zos-apps package.json files with enhanced App Store schema
 *
 * Adds:
 * - screenshots config
 * - downloads config
 * - tags, featured, releaseDate
 * - support, changelog links
 *
 * Usage: npx tsx scripts/update-app-manifests.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const APPS_DIR = '/Users/z/work/zeekay/zos-apps';

// Directories to skip (not actual apps)
const SKIP_DIRS = [
  'node_modules',
  'docs',
  'test-results',
  'playwright-report',
  'scripts',
  'tests',
  '.git',
  '.turbo',
];

// Category to tags mapping
const CATEGORY_TAGS: Record<string, string[]> = {
  'utilities': ['utility', 'tools'],
  'productivity': ['productivity', 'work'],
  'entertainment': ['entertainment', 'fun'],
  'games': ['games', 'fun', 'entertainment'],
  'media': ['media', 'audio', 'video'],
  'development': ['developer', 'code', 'programming'],
  'social': ['social', 'communication'],
  'creativity': ['creative', 'design'],
  'system': ['system', 'utility'],
  'finance': ['finance', 'crypto'],
};

// Featured apps (curated list)
const FEATURED_APPS = [
  'calculator', 'notes', 'weather', 'calendar', 'terminal',
  'music', 'photos', 'mail', 'vscode', 'figma', 'discord',
  'spotify', 'excalidraw', 'tldraw', '2048', 'doom',
];

interface PackageJson {
  name: string;
  zos?: {
    id: string;
    name: string;
    icon: string;
    category: string;
    description: string;
    screenshots?: object;
    downloads?: object;
    featured?: boolean;
    tags?: string[];
    releaseDate?: string;
    support?: string;
    changelog?: string;
    [key: string]: unknown;
  };
  repository?: {
    url: string;
  };
  [key: string]: unknown;
}

function getAppDirs(): string[] {
  const entries = fs.readdirSync(APPS_DIR, { withFileTypes: true });
  return entries
    .filter(e => e.isDirectory() && !SKIP_DIRS.includes(e.name) && !e.name.startsWith('.'))
    .map(e => e.name)
    .filter(name => {
      const pkgPath = path.join(APPS_DIR, name, 'package.json');
      return fs.existsSync(pkgPath);
    });
}

function updatePackageJson(appDir: string): boolean {
  const pkgPath = path.join(APPS_DIR, appDir, 'package.json');

  try {
    const content = fs.readFileSync(pkgPath, 'utf-8');
    const pkg: PackageJson = JSON.parse(content);

    if (!pkg.zos) {
      console.log(`  ⏭️  ${appDir} - no zos config, skipping`);
      return false;
    }

    const appName = appDir;
    const category = pkg.zos.category || 'utilities';

    // Add screenshots config if missing
    if (!pkg.zos.screenshots) {
      pkg.zos.screenshots = {
        hero: 'screenshots/hero.png',
        images: [
          'screenshots/1-main.png',
          'screenshots/2-feature.png',
        ],
      };
    }

    // Add downloads config if missing
    if (!pkg.zos.downloads) {
      pkg.zos.downloads = {
        web: `https://zos-apps.github.io/${appName}`,
      };
    }

    // Add featured flag
    if (pkg.zos.featured === undefined) {
      pkg.zos.featured = FEATURED_APPS.includes(appName);
    }

    // Add tags based on category and app name
    if (!pkg.zos.tags) {
      const baseTags = CATEGORY_TAGS[category] || ['utility'];
      pkg.zos.tags = [...baseTags, appName.replace(/-/g, ' ')];
    }

    // Add release date (today for new apps)
    if (!pkg.zos.releaseDate) {
      pkg.zos.releaseDate = '2024-12-28';
    }

    // Add support link
    if (!pkg.zos.support) {
      pkg.zos.support = `https://github.com/zos-apps/${appName}/issues`;
    }

    // Add changelog link
    if (!pkg.zos.changelog) {
      pkg.zos.changelog = `https://github.com/zos-apps/${appName}/releases`;
    }

    // Write updated package.json
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(APPS_DIR, appDir, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    console.log(`  ✅ ${appDir}`);
    return true;

  } catch (error) {
    console.log(`  ❌ ${appDir}: ${error}`);
    return false;
  }
}

function main() {
  console.log('📦 Updating zos-apps package.json files...\n');

  const apps = getAppDirs();
  console.log(`Found ${apps.length} apps to update\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const app of apps) {
    const result = updatePackageJson(app);
    if (result) {
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\n✨ Done!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);

  console.log('\nNext steps:');
  console.log('1. Capture screenshots for each app');
  console.log('2. Commit changes to each repo');
  console.log('3. Push to GitHub');
}

main();
