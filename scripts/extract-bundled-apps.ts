#!/usr/bin/env npx tsx
/**
 * Extract Bundled Apps from z-os4 Shell
 *
 * Converts window components from z-os4/apps/shell/src/components/windows/
 * into standalone zos-apps repos.
 *
 * Usage: npx tsx scripts/extract-bundled-apps.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const SHELL_WINDOWS_DIR = '/Users/z/work/zeekay/z-os4/apps/shell/src/components/windows';
const ZOS_APPS_DIR = '/Users/z/work/zeekay/zos-apps';

// Map window component names to app metadata
const APP_METADATA: Record<string, {
  name: string;
  id: string;
  icon: string;
  category: string;
  description: string;
  width: number;
  height: number;
  resizable: boolean;
}> = {
  'ActivityMonitorWindow': {
    name: 'Activity Monitor',
    id: 'ai.hanzo.activity-monitor',
    icon: '📊',
    category: 'system',
    description: 'Monitor system processes and resource usage',
    width: 700,
    height: 500,
    resizable: true,
  },
  'CalculatorWindow': {
    name: 'Calculator',
    id: 'ai.hanzo.calculator',
    icon: '🧮',
    category: 'utilities',
    description: 'A simple calculator for basic math operations',
    width: 240,
    height: 360,
    resizable: false,
  },
  'CalendarWindow': {
    name: 'Calendar',
    id: 'ai.hanzo.calendar',
    icon: '📅',
    category: 'productivity',
    description: 'Calendar and event management',
    width: 800,
    height: 600,
    resizable: true,
  },
  'ClockWindow': {
    name: 'Clock',
    id: 'ai.hanzo.clock',
    icon: '🕐',
    category: 'utilities',
    description: 'World clock, timer, and stopwatch',
    width: 320,
    height: 400,
    resizable: false,
  },
  'FaceTimeWindow': {
    name: 'FaceTime',
    id: 'ai.hanzo.facetime',
    icon: '📹',
    category: 'communication',
    description: 'Video calling application',
    width: 640,
    height: 480,
    resizable: true,
  },
  'FinderWindow': {
    name: 'Finder',
    id: 'ai.hanzo.finder',
    icon: '📁',
    category: 'system',
    description: 'File manager and browser',
    width: 800,
    height: 500,
    resizable: true,
  },
  'HanzoAIWindow': {
    name: 'Hanzo AI',
    id: 'ai.hanzo.hanzo-ai',
    icon: '🤖',
    category: 'productivity',
    description: 'AI assistant powered by Hanzo',
    width: 400,
    height: 600,
    resizable: true,
  },
  'LuxWindow': {
    name: 'Lux Wallet',
    id: 'ai.hanzo.lux-wallet',
    icon: '💎',
    category: 'finance',
    description: 'Cryptocurrency wallet for Lux Network',
    width: 400,
    height: 600,
    resizable: true,
  },
  'MailWindow': {
    name: 'Mail',
    id: 'ai.hanzo.mail',
    icon: '✉️',
    category: 'communication',
    description: 'Email client',
    width: 900,
    height: 600,
    resizable: true,
  },
  'MessagesWindow': {
    name: 'Messages',
    id: 'ai.hanzo.messages',
    icon: '💬',
    category: 'communication',
    description: 'Messaging application',
    width: 800,
    height: 600,
    resizable: true,
  },
  'MusicWindow': {
    name: 'Music',
    id: 'ai.hanzo.music',
    icon: '🎵',
    category: 'entertainment',
    description: 'Music player and library',
    width: 1000,
    height: 700,
    resizable: true,
  },
  'NotesWindow': {
    name: 'Notes',
    id: 'ai.hanzo.notes',
    icon: '📝',
    category: 'productivity',
    description: 'Quick notes and markdown editor',
    width: 500,
    height: 600,
    resizable: true,
  },
  'PhotosWindow': {
    name: 'Photos',
    id: 'ai.hanzo.photos',
    icon: '🖼️',
    category: 'entertainment',
    description: 'Photo library and viewer',
    width: 1000,
    height: 700,
    resizable: true,
  },
  'RemindersWindow': {
    name: 'Reminders',
    id: 'ai.hanzo.reminders',
    icon: '☑️',
    category: 'productivity',
    description: 'Task and reminder management',
    width: 350,
    height: 500,
    resizable: true,
  },
  'SafariWindow': {
    name: 'Safari',
    id: 'ai.hanzo.safari',
    icon: '🧭',
    category: 'utilities',
    description: 'Web browser',
    width: 1200,
    height: 800,
    resizable: true,
  },
  'SettingsWindow': {
    name: 'System Preferences',
    id: 'ai.hanzo.settings',
    icon: '⚙️',
    category: 'system',
    description: 'System settings and preferences',
    width: 700,
    height: 500,
    resizable: false,
  },
  'StickiesWindow': {
    name: 'Stickies',
    id: 'ai.hanzo.stickies',
    icon: '📌',
    category: 'productivity',
    description: 'Sticky notes for quick reminders',
    width: 300,
    height: 300,
    resizable: true,
  },
  'TerminalWindow': {
    name: 'Terminal',
    id: 'ai.hanzo.terminal',
    icon: '💻',
    category: 'development',
    description: 'Command line terminal emulator',
    width: 800,
    height: 500,
    resizable: true,
  },
  'TextEditWindow': {
    name: 'TextEdit',
    id: 'ai.hanzo.textedit',
    icon: '📄',
    category: 'productivity',
    description: 'Simple text editor',
    width: 600,
    height: 500,
    resizable: true,
  },
  'WeatherWindow': {
    name: 'Weather',
    id: 'ai.hanzo.weather',
    icon: '🌤️',
    category: 'utilities',
    description: 'Weather forecast and conditions',
    width: 360,
    height: 480,
    resizable: false,
  },
  'ZooWindow': {
    name: 'Zoo',
    id: 'ai.hanzo.zoo',
    icon: '🦁',
    category: 'finance',
    description: 'Zoo Labs Foundation DeFi platform',
    width: 800,
    height: 600,
    resizable: true,
  },
};

function getRepoName(componentName: string): string {
  // Convert "CalculatorWindow" to "calculator"
  return componentName
    .replace('Window', '')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

function convertToStandaloneApp(sourceCode: string, componentName: string): string {
  const repoName = getRepoName(componentName);
  const exportName = componentName.replace('Window', '');

  // Remove ZWindow import
  let code = sourceCode.replace(/import.*ZWindow.*from.*['"]@z-os\/ui['"];?\n?/g, '');

  // Remove onFocus from props interface (we'll keep onClose)
  code = code.replace(/\s*onFocus\?:\s*\(\)\s*=>\s*void;?\n?/g, '');

  // Remove onFocus from destructuring
  code = code.replace(/,\s*onFocus\s*}/g, ' }');
  code = code.replace(/{\s*onClose,\s*onFocus\s*}/g, '{ onClose }');

  // Replace ZWindow wrapper with just the inner content
  // This is complex because ZWindow wraps the content
  code = code.replace(
    /<ZWindow[\s\S]*?>([\s\S]*?)<\/ZWindow>/,
    (_, inner) => inner.trim()
  );

  // Update component name (remove Window suffix)
  code = code.replace(
    new RegExp(`const ${componentName}:`, 'g'),
    `const ${exportName}:`
  );
  code = code.replace(
    new RegExp(`${componentName}Props`, 'g'),
    `${exportName}Props`
  );
  code = code.replace(
    new RegExp(`export default ${componentName}`, 'g'),
    `export default ${exportName}`
  );

  return code;
}

function createPackageJson(componentName: string): string {
  const meta = APP_METADATA[componentName];
  if (!meta) {
    console.log(`  ⚠️  No metadata for ${componentName}, using defaults`);
    return '';
  }

  const repoName = getRepoName(componentName);

  const pkg = {
    name: `@zos-apps/${repoName}`,
    version: '1.0.0',
    type: 'module',
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    zos: {
      id: meta.id,
      name: meta.name,
      icon: meta.icon,
      category: meta.category,
      description: meta.description,
      permissions: [],
      window: {
        defaultSize: {
          width: meta.width,
          height: meta.height,
        },
        resizable: meta.resizable,
      },
      about: meta.description,
      screenshots: {
        hero: 'screenshots/hero.png',
        images: ['screenshots/1-main.png'],
      },
      downloads: {
        web: `https://zos-apps.github.io/${repoName}`,
      },
      featured: ['calculator', 'notes', 'terminal', 'safari', 'music'].includes(repoName),
      tags: [meta.category, repoName],
      releaseDate: new Date().toISOString().split('T')[0],
      support: `https://github.com/zos-apps/${repoName}/issues`,
      changelog: `https://github.com/zos-apps/${repoName}/releases`,
    },
    scripts: {
      build: 'tsup',
      dev: 'tsup --watch',
    },
    peerDependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0',
    },
    devDependencies: {
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      tsup: '^8.3.5',
      typescript: '^5.7.2',
    },
    description: meta.description,
    homepage: `https://zos-apps.github.io/${repoName}`,
    repository: {
      type: 'git',
      url: `git+https://github.com/zos-apps/${repoName}.git`,
    },
    bugs: {
      url: `https://github.com/zos-apps/${repoName}/issues`,
    },
    author: 'Hanzo AI',
    license: 'MIT',
    keywords: ['zos', 'app', repoName, 'macos', 'desktop'],
    publishConfig: {
      access: 'public',
      registry: 'https://registry.npmjs.org/',
    },
  };

  return JSON.stringify(pkg, null, 2);
}

function createTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      lib: ['DOM', 'DOM.Iterable', 'ES2022'],
      module: 'ESNext',
      moduleResolution: 'bundler',
      jsx: 'react-jsx',
      strict: true,
      skipLibCheck: true,
      declaration: true,
      outDir: 'dist',
    },
    include: ['src'],
  }, null, 2);
}

function createTsupConfig(): string {
  return `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
});
`;
}

async function main() {
  console.log('🚀 Extracting bundled apps from z-os4 shell...\n');

  const files = fs.readdirSync(SHELL_WINDOWS_DIR)
    .filter(f => f.endsWith('Window.tsx') && f !== 'index.ts');

  console.log(`Found ${files.length} window components to extract\n`);

  for (const file of files) {
    const componentName = file.replace('.tsx', '');
    const repoName = getRepoName(componentName);

    console.log(`📦 ${componentName} → ${repoName}`);

    const repoDir = path.join(ZOS_APPS_DIR, repoName);
    const srcDir = path.join(repoDir, 'src');

    // Check if repo already exists with content
    if (fs.existsSync(path.join(srcDir, 'index.tsx'))) {
      console.log(`   ⏭️  Already exists, skipping`);
      continue;
    }

    // Read source file
    const sourcePath = path.join(SHELL_WINDOWS_DIR, file);
    const sourceCode = fs.readFileSync(sourcePath, 'utf-8');

    // Convert to standalone app
    const standaloneCode = convertToStandaloneApp(sourceCode, componentName);

    // Create repo structure
    if (!fs.existsSync(repoDir)) {
      fs.mkdirSync(repoDir, { recursive: true });
    }
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }

    // Write files
    fs.writeFileSync(path.join(srcDir, 'index.tsx'), standaloneCode);

    const packageJson = createPackageJson(componentName);
    if (packageJson) {
      fs.writeFileSync(path.join(repoDir, 'package.json'), packageJson);
    }

    fs.writeFileSync(path.join(repoDir, 'tsconfig.json'), createTsConfig());
    fs.writeFileSync(path.join(repoDir, 'tsup.config.ts'), createTsupConfig());

    // Create screenshots directory
    const screenshotsDir = path.join(repoDir, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Initialize git if needed
    if (!fs.existsSync(path.join(repoDir, '.git'))) {
      try {
        execSync(`cd "${repoDir}" && git init`, { stdio: 'pipe' });
        fs.writeFileSync(path.join(repoDir, '.gitignore'), 'node_modules/\ndist/\n');
      } catch (e) {
        // Git init failed, continue anyway
      }
    }

    console.log(`   ✅ Created`);
  }

  console.log('\n✨ Extraction complete!');
  console.log('\nNext steps:');
  console.log('1. Review extracted apps in zos-apps/');
  console.log('2. Build each app: cd <app> && npm install && npm run build');
  console.log('3. Push to GitHub: git add . && git commit -m "feat: extract from z-os4" && git push');
}

main().catch(console.error);
