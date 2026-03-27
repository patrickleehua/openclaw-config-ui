import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs/promises';
import { existsSync, statSync, readdirSync } from 'fs';
import { spawn, execSync } from 'child_process';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3300;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(join(__dirname, 'public')));

// ============ OpenClaw Detection Constants ============
const NEW_STATE_DIRNAME = '.openclaw';
const LEGACY_STATE_DIRNAMES = ['.clawdbot', '.moldbot'];
const CONFIG_FILENAME = 'openclaw.json';
const LEGACY_CONFIG_FILENAMES = ['clawdbot.json', 'moldbot.json'];

// Config file path - default
let configFilePath = null;
let configData = null;

// Gateway process reference
let gatewayProcess = null;
let gatewayStatus = 'stopped';

// ============ Helper Functions ============
function normalize(value) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return undefined;
  }
  return trimmed;
}

function resolveEffectiveHomeDir() {
  const explicitHome = normalize(process.env.OPENCLAW_HOME);
  if (explicitHome) {
    if (explicitHome === '~' || explicitHome.startsWith('~/') || explicitHome.startsWith('~\\')) {
      const fallbackHome = normalize(process.env.HOME) || normalize(process.env.USERPROFILE);
      if (fallbackHome) {
        return explicitHome.replace(/^~(?=$|[\\/])/, fallbackHome);
      }
      return undefined;
    }
    return resolve(explicitHome);
  }
  return normalize(process.env.HOME) ||
         normalize(process.env.USERPROFILE) ||
         normalize(os.homedir());
}

function resolveRequiredHomeDir() {
  return resolveEffectiveHomeDir() || resolve(process.cwd());
}

function resolveUserPath(input) {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('~')) {
    const home = resolveRequiredHomeDir();
    const expanded = trimmed.replace(/^~(?=$|[\\/])/, home);
    return resolve(expanded);
  }
  return resolve(trimmed);
}

// ============ OpenClaw Detection Functions ============
function resolveStateDir() {
  const override = normalize(process.env.OPENCLAW_STATE_DIR);
  if (override) {
    return resolveUserPath(override);
  }

  const homeDir = resolveRequiredHomeDir();
  const newDir = join(homeDir, NEW_STATE_DIRNAME);

  if (existsSync(newDir)) {
    return newDir;
  }

  for (const legacyDir of LEGACY_STATE_DIRNAMES) {
    const legacyPath = join(homeDir, legacyDir);
    if (existsSync(legacyPath)) {
      return legacyPath;
    }
  }

  return newDir;
}

function resolveConfigPath() {
  const configOverride = normalize(process.env.OPENCLAW_CONFIG_PATH);
  if (configOverride) {
    return resolveUserPath(configOverride);
  }

  const stateDir = resolveStateDir();
  const newConfigPath = join(stateDir, CONFIG_FILENAME);
  if (existsSync(newConfigPath)) {
    return newConfigPath;
  }

  for (const legacyName of LEGACY_CONFIG_FILENAMES) {
    const legacyPath = join(stateDir, legacyName);
    if (existsSync(legacyPath)) {
      return legacyPath;
    }
  }

  return newConfigPath;
}

function resolveConfigCandidates() {
  const candidates = [];
  const homeDir = resolveRequiredHomeDir();

  const explicit = normalize(process.env.OPENCLAW_CONFIG_PATH);
  if (explicit) {
    candidates.push(resolveUserPath(explicit));
  }

  const stateOverride = normalize(process.env.OPENCLAW_STATE_DIR);
  if (stateOverride) {
    const resolved = resolveUserPath(stateOverride);
    candidates.push(join(resolved, CONFIG_FILENAME));
    for (const legacyName of LEGACY_CONFIG_FILENAMES) {
      candidates.push(join(resolved, legacyName));
    }
  }

  const defaultDirs = [
    join(homeDir, NEW_STATE_DIRNAME),
    ...LEGACY_STATE_DIRNAMES.map(d => join(homeDir, d))
  ];

  for (const dir of defaultDirs) {
    candidates.push(join(dir, CONFIG_FILENAME));
    for (const legacyName of LEGACY_CONFIG_FILENAMES) {
      candidates.push(join(dir, legacyName));
    }
  }

  return [...new Set(candidates)];
}

function findGlobalOpenClawPaths() {
  const found = [];
  const platform = os.platform();

  try {
    let result;
    if (platform === 'win32') {
      result = execSync('where openclaw 2>nul', { encoding: 'utf-8' });
    } else {
      result = execSync('which openclaw 2>/dev/null', { encoding: 'utf-8' });
    }
    if (result) {
      const binaryPath = result.trim().split('\n')[0];
      if (binaryPath && existsSync(binaryPath)) {
        found.push({ type: 'binary', path: binaryPath });
      }
    }
  } catch {}

  const packageCandidates = [
    '/root/.openclaw/node_modules/openclaw/package.json',
    '/usr/lib/node_modules/openclaw/package.json',
    '/usr/local/lib/node_modules/openclaw/package.json',
    join(process.env.HOME || process.env.USERPROFILE || '', '.npm/lib/node_modules/openclaw/package.json'),
    join(process.env.HOME || process.env.USERPROFILE || '', '.local/lib/node_modules/openclaw/package.json'),
  ];

  for (const candidate of packageCandidates) {
    if (existsSync(candidate)) {
      found.push({ type: 'package', path: dirname(candidate) });
    }
  }

  return found;
}

function resolveVersion() {
  const envVersion = normalize(process.env.OPENCLAW_VERSION) ||
                     normalize(process.env.OPENCLAW_BUNDLED_VERSION) ||
                     normalize(process.env.npm_package_version);
  if (envVersion) {
    return { version: envVersion, source: 'environment' };
  }

  const stateDir = resolveStateDir();
  const localPkgPath = join(stateDir, 'node_modules', 'openclaw', 'package.json');
  try {
    if (existsSync(localPkgPath)) {
      const pkg = JSON.parse(require('fs').readFileSync(localPkgPath, 'utf-8'));
      if (pkg.version) {
        return { version: pkg.version, source: localPkgPath };
      }
    }
  } catch {}

  try {
    const pkg = JSON.parse(execSync('npm list -g openclaw --json 2>/dev/null', { encoding: 'utf-8' }));
    if (pkg?.dependencies?.openclaw?.version) {
      return { version: pkg.dependencies.openclaw.version, source: 'npm global' };
    }
  } catch {}

  return { version: null, source: null };
}

// Helper: Read config file
async function readConfigFile() {
  if (!configFilePath || !existsSync(configFilePath)) {
    return null;
  }
  try {
    const content = await fs.readFile(configFilePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading config:', err);
    return null;
  }
}

// Helper: Write config file
async function writeConfigFile(data) {
  if (!configFilePath) {
    throw new Error('No config file path set');
  }
  await fs.writeFile(configFilePath, JSON.stringify(data, null, 2), 'utf-8');
  configData = data;
}

// API: Load config file
app.post('/api/config/load', async (req, res) => {
  try {
    const { path: filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }

    // Expand path
    let expandedPath = filePath.replace('~', process.env.HOME || process.env.USERPROFILE);
    expandedPath = expandedPath.replace(/\//g, '\\');

    if (!existsSync(expandedPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    configFilePath = expandedPath;
    configData = await readConfigFile();

    res.json({
      success: true,
      path: configFilePath,
      data: configData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Reload config
app.post('/api/config/reload', async (req, res) => {
  try {
    if (!configFilePath) {
      return res.status(400).json({ error: 'No config file loaded' });
    }
    configData = await readConfigFile();
    res.json({ success: true, data: configData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get current config
app.get('/api/config', async (req, res) => {
  try {
    if (!configFilePath) {
      return res.json({ path: null, data: null });
    }
    configData = await readConfigFile();
    res.json({ path: configFilePath, data: configData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Save config
app.post('/api/config/save', async (req, res) => {
  try {
    await writeConfigFile(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update specific section
app.patch('/api/config/:section', async (req, res) => {
  try {
    if (!configData) {
      return res.status(400).json({ error: 'No config loaded' });
    }
    const { section } = req.params;
    configData[section] = req.body;
    await writeConfigFile(configData);
    res.json({ success: true, data: configData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Delete section
app.delete('/api/config/:section', async (req, res) => {
  try {
    if (!configData) {
      return res.status(400).json({ error: 'No config loaded' });
    }
    const { section } = req.params;
    delete configData[section];
    await writeConfigFile(configData);
    res.json({ success: true, data: configData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Models CRUD
app.get('/api/models', async (req, res) => {
  try {
    const config = await readConfigFile();
    res.json(config?.models?.providers || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/models/:provider', async (req, res) => {
  try {
    if (!configData) configData = await readConfigFile();
    if (!configData.models) configData.models = { mode: 'merge', providers: {} };
    if (!configData.models.providers) configData.models.providers = {};

    const { provider } = req.params;
    configData.models.providers[provider] = req.body;
    await writeConfigFile(configData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/models/:provider', async (req, res) => {
  try {
    if (!configData) configData = await readConfigFile();
    if (configData?.models?.providers) {
      delete configData.models.providers[req.params.provider];
      await writeConfigFile(configData);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Model CRUD within provider
app.post('/api/models/:provider/models', async (req, res) => {
  try {
    if (!configData) configData = await readConfigFile();
    if (!configData.models) configData.models = { mode: 'merge', providers: {} };
    if (!configData.models.providers[req.params.provider]) {
      configData.models.providers[req.params.provider] = { models: [] };
    }
    if (!configData.models.providers[req.params.provider].models) {
      configData.models.providers[req.params.provider].models = [];
    }
    configData.models.providers[req.params.provider].models.push(req.body);
    await writeConfigFile(configData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/models/:provider/models/:index', async (req, res) => {
  try {
    if (!configData) configData = await readConfigFile();
    const idx = parseInt(req.params.index);
    if (configData?.models?.providers?.[req.params.provider]?.models?.[idx] !== undefined) {
      configData.models.providers[req.params.provider].models[idx] = req.body;
      await writeConfigFile(configData);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/models/:provider/models/:index', async (req, res) => {
  try {
    if (!configData) configData = await readConfigFile();
    const idx = parseInt(req.params.index);
    if (configData?.models?.providers?.[req.params.provider]?.models) {
      configData.models.providers[req.params.provider].models.splice(idx, 1);
      await writeConfigFile(configData);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Agents CRUD
app.get('/api/agents', async (req, res) => {
  try {
    const config = await readConfigFile();
    res.json(config?.agents || { defaults: {}, list: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    if (!configData) configData = await readConfigFile();
    if (!configData.agents) configData.agents = { defaults: {}, list: [] };
    if (!configData.agents.list) configData.agents.list = [];

    const newAgent = { id: req.body.id || `agent-${Date.now()}`, ...req.body };
    configData.agents.list.push(newAgent);
    await writeConfigFile(configData);
    res.json({ success: true, agent: newAgent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/agents/:id', async (req, res) => {
  try {
    if (!configData) configData = await readConfigFile();
    if (configData?.agents?.list) {
      const idx = configData.agents.list.findIndex(a => a.id === req.params.id);
      if (idx >= 0) {
        configData.agents.list[idx] = { ...configData.agents.list[idx], ...req.body };
        await writeConfigFile(configData);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/agents/:id', async (req, res) => {
  try {
    if (!configData) configData = await readConfigFile();
    if (configData?.agents?.list) {
      configData.agents.list = configData.agents.list.filter(a => a.id !== req.params.id);
      await writeConfigFile(configData);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Channels CRUD
app.get('/api/channels', async (req, res) => {
  try {
    const config = await readConfigFile();
    res.json(config?.channels || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/channels/:channel', async (req, res) => {
  try {
    if (!configData) configData = await readConfigFile();
    if (!configData.channels) configData.channels = {};
    configData.channels[req.params.channel] = req.body;
    await writeConfigFile(configData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/channels/:channel', async (req, res) => {
  try {
    if (!configData) configData = await readConfigFile();
    if (configData?.channels) {
      delete configData.channels[req.params.channel];
      await writeConfigFile(configData);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Skills CRUD
app.get('/api/skills', async (req, res) => {
  try {
    const config = await readConfigFile();
    res.json(config?.skills || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/skills', async (req, res) => {
  try {
    if (!configData) configData = await readConfigFile();
    configData.skills = req.body;
    await writeConfigFile(configData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: OpenClaw Detection
app.get('/api/detect', async (req, res) => {
  try {
    const homeDir = resolveRequiredHomeDir();
    const stateDir = resolveStateDir();
    const configPath = resolveConfigPath();
    const configCandidates = resolveConfigCandidates();
    const versionInfo = resolveVersion();
    const globalPaths = findGlobalOpenClawPaths();

    const configCandidatesWithStatus = configCandidates.slice(0, 10).map(p => ({
      path: p,
      exists: existsSync(p)
    }));

    res.json({
      homeDir,
      stateDir,
      stateDirExists: existsSync(stateDir),
      configPath,
      configExists: existsSync(configPath),
      configCandidates: configCandidatesWithStatus,
      version: versionInfo.version,
      versionSource: versionInfo.source,
      globalInstallations: globalPaths,
      environment: {
        OPENCLAW_HOME: process.env.OPENCLAW_HOME || null,
        OPENCLAW_STATE_DIR: process.env.OPENCLAW_STATE_DIR || null,
        OPENCLAW_CONFIG_PATH: process.env.OPENCLAW_CONFIG_PATH || null,
        OPENCLAW_VERSION: process.env.OPENCLAW_VERSION || null,
      },
      platform: os.platform()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Auto-load detected config
app.post('/api/config/auto-load', async (req, res) => {
  try {
    const detectedPath = resolveConfigPath();

    if (!existsSync(detectedPath)) {
      return res.status(404).json({ error: 'No config file found', detectedPath });
    }

    configFilePath = detectedPath;
    configData = await readConfigFile();

    res.json({
      success: true,
      path: configFilePath,
      data: configData,
      autoDetected: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Gateway controls
app.get('/api/gateway', async (req, res) => {
  try {
    const config = await readConfigFile();
    res.json({
      config: config?.gateway || {},
      status: gatewayStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gateway/start', async (req, res) => {
  try {
    if (gatewayStatus === 'running') {
      return res.json({ success: true, status: 'running', message: 'Already running' });
    }

    // Use openclaw gateway start command
    gatewayProcess = spawn('openclaw', ['gateway', 'start'], {
      cwd: process.cwd(),
      shell: true,
      stdio: 'pipe'
    });

    gatewayStatus = 'running';

    gatewayProcess.on('close', () => {
      gatewayStatus = 'stopped';
      gatewayProcess = null;
    });

    gatewayProcess.stderr?.on('data', (data) => {
      console.error('[Gateway Error]', data.toString());
    });

    res.json({ success: true, status: gatewayStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gateway/stop', async (req, res) => {
  try {
    // Use openclaw gateway stop command
    const stopProcess = spawn('openclaw', ['gateway', 'stop'], {
      cwd: process.cwd(),
      shell: true
    });

    if (gatewayProcess) {
      gatewayProcess.kill();
      gatewayProcess = null;
    }
    gatewayStatus = 'stopped';

    res.json({ success: true, status: gatewayStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gateway/restart', async (req, res) => {
  try {
    // Use openclaw gateway restart command
    if (gatewayProcess) {
      gatewayProcess.kill();
      gatewayProcess = null;
    }

    await new Promise(r => setTimeout(r, 1000));

    gatewayProcess = spawn('openclaw', ['gateway', 'restart'], {
      cwd: process.cwd(),
      shell: true,
      stdio: 'pipe'
    });

    gatewayStatus = 'running';

    gatewayProcess.on('close', () => {
      gatewayStatus = 'stopped';
      gatewayProcess = null;
    });

    res.json({ success: true, status: gatewayStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get default model
app.get('/api/default-model', async (req, res) => {
  try {
    const config = await readConfigFile();
    const primaryModel = config?.agents?.defaults?.model?.primary;
    res.json({ model: primaryModel || 'Not set' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Logs
const logs = [];
app.get('/api/logs', (req, res) => {
  res.json(logs.slice(-100));
});

app.post('/api/logs', (req, res) => {
  logs.push({ ...req.body, timestamp: new Date().toISOString() });
  if (logs.length > 1000) logs.shift();
  res.json({ success: true });
});

// API: Read external log file
app.post('/api/logs/read-file', async (req, res) => {
  try {
    const { path: logPath } = req.body;
    if (!logPath) {
      return res.status(400).json({ error: 'Log file path is required' });
    }

    const expandedPath = resolveUserPath(logPath);

    if (!existsSync(expandedPath)) {
      return res.status(404).json({ error: 'Log file not found', path: expandedPath });
    }

    const stats = statSync(expandedPath);
    if (stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is a directory, not a file' });
    }

    // Read last N lines (default 500 lines, max 2000)
    const maxLines = Math.min(req.body.lines || 500, 2000);
    const content = await fs.readFile(expandedPath, 'utf-8');
    const lines = content.split('\n').slice(-maxLines);

    res.json({
      success: true,
      path: expandedPath,
      lines: lines,
      totalLines: content.split('\n').length,
      fileSize: stats.size,
      lastModified: stats.mtime
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: List log files in directory
app.post('/api/logs/list-files', async (req, res) => {
  try {
    const { path: dirPath } = req.body;
    if (!dirPath) {
      return res.status(400).json({ error: 'Directory path is required' });
    }

    const expandedPath = resolveUserPath(dirPath);

    if (!existsSync(expandedPath)) {
      return res.status(404).json({ error: 'Directory not found', path: expandedPath });
    }

    const stats = statSync(expandedPath);
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    const entries = readdirSync(expandedPath, { withFileTypes: true });
    const logFiles = entries
      .filter(e => e.isFile() && (e.name.endsWith('.log') || e.name.endsWith('.txt')))
      .map(e => ({
        name: e.name,
        path: join(expandedPath, e.name)
      }));

    res.json({
      success: true,
      path: expandedPath,
      files: logFiles
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`OpenClaw Config UI running at http://localhost:${PORT}`);
});
