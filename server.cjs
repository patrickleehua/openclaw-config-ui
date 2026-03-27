const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3300;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Config file path - default
let configFilePath = null;
let configData = null;

// Gateway process reference
let gatewayProcess = null;
let gatewayStatus = 'stopped';

// Helper: Read config file
async function readConfigFile() {
  if (!configFilePath || !fs.existsSync(configFilePath)) {
    return null;
  }
  try {
    const content = await fs.promises.readFile(configFilePath, 'utf-8');
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
  await fs.promises.writeFile(configFilePath, JSON.stringify(data, null, 2), 'utf-8');
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

    if (!fs.existsSync(expandedPath)) {
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

    // Try to start openclaw gateway
    gatewayProcess = spawn('npx', ['openclaw', 'gateway'], {
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

app.post('/api/gateway/stop', async (req, res) => {
  try {
    if (gatewayProcess) {
      gatewayProcess.kill();
      gatewayProcess = null;
      gatewayStatus = 'stopped';
    }
    res.json({ success: true, status: gatewayStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gateway/restart', async (req, res) => {
  try {
    if (gatewayProcess) {
      gatewayProcess.kill();
      gatewayProcess = null;
    }

    await new Promise(r => setTimeout(r, 1000));

    gatewayProcess = spawn('npx', ['openclaw', 'gateway'], {
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

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`OpenClaw Config UI running at http://localhost:${PORT}`);
});
