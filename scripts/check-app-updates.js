#!/usr/bin/env node
/**
 * Check for app updates from zos-apps GitHub repos
 *
 * Compares local app versions with latest GitHub releases
 * and outputs list of apps that need updating.
 *
 * Usage: node scripts/check-app-updates.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_ORG = 'zos-apps';
const GITHUB_API = 'https://api.github.com';

// Get GitHub token from environment
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'zos-app-updater',
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

async function getLatestRelease(repo) {
  try {
    const url = `${GITHUB_API}/repos/${GITHUB_ORG}/${repo}/releases/latest`;
    const release = await fetchJSON(url);
    return release.tag_name || release.name || null;
  } catch (e) {
    // No releases, check commits
    try {
      const url = `${GITHUB_API}/repos/${GITHUB_ORG}/${repo}/commits?per_page=1`;
      const commits = await fetchJSON(url);
      if (commits.length > 0) {
        return commits[0].sha.substring(0, 7);
      }
    } catch (e2) {
      return null;
    }
  }
  return null;
}

async function getLastCommitDate(repo) {
  try {
    const url = `${GITHUB_API}/repos/${GITHUB_ORG}/${repo}/commits?per_page=1`;
    const commits = await fetchJSON(url);
    if (commits.length > 0) {
      return new Date(commits[0].commit.committer.date);
    }
  } catch (e) {
    return null;
  }
  return null;
}

async function listRepos() {
  const repos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `${GITHUB_API}/orgs/${GITHUB_ORG}/repos?per_page=${perPage}&page=${page}`;
    const pageRepos = await fetchJSON(url);

    if (!Array.isArray(pageRepos) || pageRepos.length === 0) break;

    repos.push(...pageRepos.map(r => ({
      name: r.name,
      updated_at: new Date(r.updated_at),
      pushed_at: new Date(r.pushed_at),
    })));

    if (pageRepos.length < perPage) break;
    page++;
  }

  return repos;
}

async function main() {
  console.log('🔍 Checking for app updates...\n');

  const repos = await listRepos();
  console.log(`Found ${repos.length} repos in ${GITHUB_ORG}\n`);

  // Check which apps were updated in last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const updatedApps = [];

  for (const repo of repos) {
    if (repo.pushed_at > oneDayAgo) {
      updatedApps.push(repo.name);
      console.log(`📦 ${repo.name} - updated ${repo.pushed_at.toISOString()}`);
    }
  }

  console.log(`\n✅ ${updatedApps.length} apps updated in last 24 hours`);

  // Set GitHub Actions outputs
  if (process.env.GITHUB_OUTPUT) {
    const outputFile = process.env.GITHUB_OUTPUT;
    fs.appendFileSync(outputFile, `apps_updated=${updatedApps.length > 0}\n`);
    fs.appendFileSync(outputFile, `updated_list=${JSON.stringify(updatedApps)}\n`);
  } else {
    console.log('\nOutput:', {
      apps_updated: updatedApps.length > 0,
      updated_list: updatedApps,
    });
  }
}

main().catch(console.error);
