# zOS

A lightweight, web-based operating system experience built with React, TypeScript, and modern web technologies.

[![CI/CD](https://github.com/z-os4/os/actions/workflows/ci.yml/badge.svg)](https://github.com/z-os4/os/actions/workflows/ci.yml)

**[Live Demo](https://z-os4.github.io/os/)** | **[App Store](https://github.com/zos-apps)**

## Features

- macOS-inspired desktop environment
- **Dynamic app loading** from [zos-apps](https://github.com/zos-apps) organization
- 57+ installable applications
- Window management with drag, resize, minimize, maximize
- Spotlight search (⌘+Space)
- Dock with app launching and running indicators
- Dark mode optimized UI
- Hanzo AI, Lux Wallet, and Zoo ecosystem integration

## Architecture

zOS is designed to be **lightweight** - the core shell contains no bundled apps. Instead, apps are:

1. **Dynamically discovered** from the [zos-apps](https://github.com/zos-apps) GitHub organization
2. **Installed on-demand** via the App Store
3. **Independently versioned** and updated

## Quick Start

```bash
# Clone the repository
git clone https://github.com/z-os4/os.git
cd os

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Packages

| Package | Description |
|---------|-------------|
| [@z-os/core](packages/core) | Core hooks, contexts, and utilities |
| [@z-os/ui](packages/ui) | UI components (windows, menus, controls) |
| [@z-os/apps](packages/apps) | Dynamic app loader (fetches from zos-apps) |
| [@z-os/sdk](packages/sdk) | SDK for building zOS apps |
| [@z-os/apps-loader](packages/apps-loader) | App loading runtime |

## Apps

Apps are hosted in the [zos-apps](https://github.com/zos-apps) GitHub organization. Each app is:

- **Standalone** - independent repository with its own versioning
- **Self-documenting** - includes README, docs site, and metadata
- **CI/CD enabled** - automated builds, tests, and releases

### Browse Apps

- **GitHub**: [github.com/zos-apps](https://github.com/zos-apps)
- **Docs**: `https://zos-apps.github.io/{app-name}`
- **npm**: `@zos-apps/{app-name}`

### App Categories

| Category | Apps |
|----------|------|
| **Productivity** | Calculator, Calendar, Notes, Reminders, Todo |
| **Entertainment** | Music, Photos, Podcasts, Netflix, Spotify, YouTube |
| **Games** | 2048, Chess, Minesweeper, Snake, Solitaire, Sudoku, Tetris |
| **Development** | Terminal, VS Code, CodePen, Console |
| **Communication** | Discord, Slack, Gmail, WhatsApp, Twitter |
| **Utilities** | Clock, Weather, Screenshot, Files, Preview |
| **Audio** | Ableton Live, Rekordbox |
| **System** | App Store, Spotlight, Disk Utility |

### Creating Apps

Use the [@z-os/sdk](packages/sdk) to build your own zOS apps:

```bash
# Create a new app
npx create-zos-app my-app

# Development
cd my-app
npm run dev

# Build
npm run build
```

See the [App Development Guide](https://zos-apps.github.io/template) for more details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT © [Hanzo AI](https://hanzo.ai)
