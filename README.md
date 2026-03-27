<div align="center">

# OpenClaw Config UI

<img src="public/favicon.svg" alt="OpenClaw Logo" width="120" height="120">

**Modern Configuration Management Interface for OpenClaw**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-24C8D8?logo=tauri)](https://tauri.app)
[![Node](https://img.shields.io/badge/Node.js->=18-339933?logo=node.js)](https://nodejs.org)

[Getting Started](#-getting-started) • [Features](#-features) • [Development](#-development) • [Build](#-build)

</div>

---

## Overview

OpenClaw Config UI is a cross-platform desktop application built with [Tauri](https://tauri.app) that provides an intuitive graphical interface for managing OpenClaw gateway configurations. It bundles a lightweight Express server for real-time configuration management and gateway control.

## Features

- **Cross-Platform** - Native desktop app for Windows, macOS, and Linux
- **Real-time Config Management** - Live editing and hot-reload of OpenClaw settings
- **Gateway Control** - Start, stop, and monitor the OpenClaw gateway from the UI
- **Modern UI** - Clean interface built with Tailwind CSS
- **Lightweight** - Bundled sidecar server, minimal resource footprint
- **Auto-Discovery** - Automatically detects OpenClaw installation and config paths

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Tauri 2.x](https://tauri.app) | Desktop application framework |
| [Express.js](https://expressjs.com) | Backend server |
| [Tailwind CSS](https://tailwindcss.com) | Styling |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [Rust](https://rust-lang.org) (for Tauri builds)
- [pnpm](https://pnpm.io) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/openclaw/openclaw.git
cd openclaw/openclawconfigui

# Install dependencies
npm install

# Run in development mode
npm run tauri:dev
```

## Development

```bash
# Start the dev server only
npm run dev

# Start Tauri in development mode
npm run tauri:dev
```

The app runs on `http://localhost:3300` by default.

## Build

### Prerequisites

Ensure you have the Tauri CLI and Rust toolchain installed:

```bash
# Install Tauri CLI (if not already installed)
npm install -g @tauri-apps/cli

# Verify Rust installation
rustc --version
```

### Production Build

```bash
# Build the sidecar server and Tauri app
npm run tauri:build
```

Output binaries will be in `src-tauri/target/release/bundle/`.

### Build Sidecar Only

```bash
# Using pkg
npm run build:server

# Or using Bun
npm run build:server:bun
```

## Project Structure

```
openclawconfigui/
├── public/              # Frontend static files
├── src-tauri/           # Tauri configuration
│   ├── binaries/        # Sidecar server binaries
│   ├── icons/           # App icons
│   └── tauri.conf.json  # Tauri config
├── scripts/             # Build scripts
├── server.js            # Express backend server
└── tailwind.config.js   # Tailwind configuration
```

## Configuration

The app manages the `openclaw.json` configuration file. Key settings include:

- **Gateway settings** - Model providers, API keys, routing
- **Channel integrations** - Discord, Slack, Telegram, etc.
- **Agent configurations** - Behavior and capabilities

## API Endpoints

The embedded Express server exposes:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/config` | GET | Get current configuration |
| `/api/config` | POST | Update configuration |
| `/api/gateway/start` | POST | Start the gateway |
| `/api/gateway/stop` | POST | Stop the gateway |
| `/api/gateway/status` | GET | Get gateway status |

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [OpenClaw](https://github.com/openclaw/openclaw) - Multi-channel AI Gateway

---

<div align="center">

Made with by the OpenClaw Team

[Report Bug](https://github.com/openclaw/openclaw/issues) · [Request Feature](https://github.com/openclaw/openclaw/issues)

</div>
