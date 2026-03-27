// Config Management Module

// Use window-scoped configData for module sharing
window.configData = window.configData || null;
window.configPath = window.configPath || null;
window.detectedInfo = window.detectedInfo || null;

function getConfigData() {
  return window.configData;
}

function setConfigData(data) {
  window.configData = data;
}

function getConfigPath() {
  return window.configPath;
}

// ============ System File Picker Handler ============
function handleConfigFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Update path input with file name
  document.getElementById('config-path-input').value = file.name;

  // Read file content directly using FileReader
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      const data = JSON.parse(content);

      window.configData = data;
      window.configPath = file.name;

      // Update UI
      document.getElementById('current-path').classList.remove('hidden');
      document.getElementById('loaded-path').textContent = file.name;

      showToast('Config loaded successfully', 'success');
      updateAllViews();
      addLog('info', `Config loaded from ${file.name}`);

    } catch (err) {
      showToast('Invalid JSON file: ' + err.message, 'error');
    }
  };
  reader.onerror = function() {
    showToast('Failed to read file', 'error');
  };
  reader.readAsText(file);

  // Reset the input so the same file can be selected again
  event.target.value = '';
}

// ============ Auto-detect OpenClaw Config ============
async function detectOpenClawConfig() {
  try {
    const response = await fetch('/api/detect');
    const result = await response.json();

    if (result.error) {
      showToast(result.error, 'error');
      return null;
    }

    window.detectedInfo = result;

    // Update UI with detection results
    updateDetectionUI(result);

    return result;
  } catch (err) {
    showToast('Failed to detect OpenClaw: ' + err.message, 'error');
    return null;
  }
}

function updateDetectionUI(info) {
  // Update config path input if config exists
  if (info.configExists) {
    document.getElementById('config-path-input').value = info.configPath;
  }

  // Update detection info display
  const detectionEl = document.getElementById('detection-info');
  if (detectionEl) {
    detectionEl.innerHTML = `
      <div class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-400">State Dir:</span>
          <span class="${info.stateDirExists ? 'text-green-400' : 'text-gray-500'}">${info.stateDir}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Config Path:</span>
          <span class="${info.configExists ? 'text-green-400' : 'text-gray-500'}">${info.configPath}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Version:</span>
          <span class="${info.version ? 'text-accent' : 'text-gray-500'}">${info.version || 'Not detected'}</span>
        </div>
      </div>
    `;
  }
}

async function autoLoadConfig() {
  try {
    const response = await fetch('/api/config/auto-load', { method: 'POST' });
    const result = await response.json();

    if (result.error) {
      showToast(result.error, 'error');
      // Still try to detect to show available paths
      await detectOpenClawConfig();
      return;
    }

    window.configData = result.data;
    window.configPath = result.path;

    document.getElementById('current-path').classList.remove('hidden');
    document.getElementById('loaded-path').textContent = window.configPath;

    showToast('Config auto-loaded successfully', 'success');
    updateAllViews();
    addLog('info', `Config auto-loaded from ${window.configPath}`);

  } catch (err) {
    showToast('Failed to auto-load config: ' + err.message, 'error');
  }
}

async function loadConfig() {
  const pathInput = document.getElementById('config-path-input');
  const path = pathInput.value.trim();

  if (!path) {
    showToast('Please enter a config file path', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/config/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });

    const result = await response.json();

    if (result.error) {
      showToast(result.error, 'error');
      return;
    }

    window.configData = result.data;
    window.configPath = result.path;

    document.getElementById('current-path').classList.remove('hidden');
    document.getElementById('loaded-path').textContent = window.configPath;

    showToast('Config loaded successfully', 'success');
    updateAllViews();
    addLog('info', `Config loaded from ${window.configPath}`);

  } catch (err) {
    showToast('Failed to load config: ' + err.message, 'error');
  }
}

async function reloadConfig() {
  if (!window.configPath) {
    showToast('No config loaded', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/config/reload', { method: 'POST' });
    const result = await response.json();

    if (result.error) {
      showToast(result.error, 'error');
      return;
    }

    window.configData = result.data;
    showToast('Config reloaded', 'success');
    updateAllViews();
    addLog('info', 'Config reloaded');

  } catch (err) {
    showToast('Failed to reload: ' + err.message, 'error');
  }
}

async function saveRawConfig() {
  try {
    const editor = document.getElementById('raw-config-editor');
    const data = JSON.parse(editor.value);

    const response = await fetch('/api/config/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (result.success) {
      showToast('Config saved', 'success');
      await reloadConfig();
    }
  } catch (err) {
    showToast('Invalid JSON: ' + err.message, 'error');
  }
}

function updateRawConfig() {
  const editor = document.getElementById('raw-config-editor');
  editor.value = JSON.stringify(window.configData, null, 2);
}

// Export for module usage
window.ConfigModule = {
  getConfigData,
  setConfigData,
  getConfigPath,
  detectOpenClawConfig,
  autoLoadConfig,
  loadConfig,
  reloadConfig,
  saveRawConfig,
  updateRawConfig
};
