#!/usr/bin/env node
/**
 * Update App Registry
 *
 * Fetches latest app manifests from zos-apps repos and generates
 * a unified registry.json file for fast app discovery.
 *
 * Usage: node scripts/update-registry.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_ORG = 'zos-apps';
const GITHUB_API = 'https://api.github.com';
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/zos-apps';

// Get GitHub token from environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'zos-registry-updater',
        'Accept': 'application/vnd.github.v3+json',
      },
    };

    if (GITHUB_TOKEN) {
      options.headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchPackageJson(repoName) {
  try {
    const url = `https://raw.githubusercontent.com/${GITHUB_ORG}/${repoName}/main/package.json`;
    return await fetchJSON(url);
  } catch (e) {
    return null;
  }
}

async function listRepos() {
  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${GITHUB_API}/orgs/${GITHUB_ORG}/repos?per_page=${perPage}&page=${page}`;
    const pageRepos = await fetchJSON(url);

    if (!Array.isArray(pageRepos) || pageRepos.length === 0) break;

    repos.push(...pageRepos.filter(r => !r.name.startsWith('.')));

    if (pageRepos.length < perPage) break;
    page++;
  }

  return repos;
}

function resolveScreenshotUrl(repoName, relativePath) {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  return `${CDN_BASE}/${repoName}@main/${relativePath}`;
}

async function main() {
  console.log('📦 Updating app registry...\n');

  const repos = await listRepos();
  console.log(`Found ${repos.length} repos\n`);

  const registry = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    apps: [],
  };

  for (const repo of repos) {
    process.stdout.write(`  ${repo.name}... `);

    const pkg = await fetchPackageJson(repo.name);
    if (!pkg?.zos) {
      console.log('⏭️  no zos config');
      continue;
    }

    const zos = pkg.zos;

    // Resolve screenshot URLs
    let screenshots = null;
    if (zos.screenshots) {
      screenshots = {
        hero: resolveScreenshotUrl(repo.name, zos.screenshots.hero),
        images: (zos.screenshots.images || []).map(img =>
          resolveScreenshotUrl(repo.name, img)
        ),
        video: zos.screenshots.video,
      };
    }

    const app = {
      id: zos.id || `ai.hanzo.${repo.name}`,
      name: zos.name || repo.name,
      icon: zos.icon || '📦',
      category: zos.category || 'other',
      description: zos.description || pkg.description || '',
      version: pkg.version || '1.0.0',
      repo: repo.name,
      repoUrl: repo.html_url,
      module: `${CDN_BASE}/${repo.name}@main/dist/index.js`,

      // App Store metadata
      about: zos.about,
      features: zos.features,
      screenshots,
      downloads: zos.downloads,
      featured: zos.featured || false,
      tags: zos.tags || [],
      releaseDate: zos.releaseDate,

      // Links
      docs: zos.docs,
      site: zos.site,
      support: zos.support,
      changelog: zos.changelog,

      // Window config
      window: zos.window,
      permissions: zos.permissions,

      // Timestamps
      updatedAt: repo.pushed_at,
    };

    registry.apps.push(app);
    console.log('✅');
  }

  // Sort by featured first, then by name
  registry.apps.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return a.name.localeCompare(b.name);
  });

  // Write registry to file
  const outputPath = path.join(__dirname, '..', 'public', 'registry.json');
  const outputDir = path.dirname(outputPath);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2));

  console.log(`\n✨ Registry updated: ${registry.apps.length} apps`);
  console.log(`   Output: ${outputPath}`);
}

main().catch(console.error);
