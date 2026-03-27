import { execSync } from 'child_process';
import { mkdirSync, existsSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const binariesDir = join(rootDir, 'src-tauri', 'binaries');

// Ensure binaries directory exists
if (!existsSync(binariesDir)) {
  mkdirSync(binariesDir, { recursive: true });
}

console.log('Building sidecar binaries...');

// Build for Windows (use CommonJS version)
console.log('Building for Windows x64...');
execSync(`npx pkg server.cjs --targets node18-win-x64 --output "${join(binariesDir, 'server-x86_64-pc-windows-msvc.exe')}" --config package.json`, {
  cwd: rootDir,
  stdio: 'inherit'
});

// Build for Linux
console.log('Building for Linux x64...');
execSync(`npx pkg server.cjs --targets node18-linux-x64 --output "${join(binariesDir, 'server-x86_64-unknown-linux-gnu')}" --config package.json`, {
  cwd: rootDir,
  stdio: 'inherit'
});

console.log('Sidecar binaries built successfully!');
