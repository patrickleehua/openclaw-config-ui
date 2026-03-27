// OpenClaw Config Manager - Main Application Entry
// This file serves as the main coordinator for all modules

// ============ API Base URL ============
// In Tauri production, use localhost; in dev, use relative path
window.API_BASE = window.__TAURI_INTERNALS__ ? 'http://localhost:3300' : '';

// Override fetch to prepend API_BASE
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (typeof url === 'string' && url.startsWith('/api/')) {
    url = window.API_BASE + url;
  }
  return originalFetch(url, options);
};

// ============ Update All Views ============
function updateAllViews() {
  if (!window.configData) return;

  if (typeof updateOverview === 'function') updateOverview();
  if (typeof updateModelsList === 'function') updateModelsList();
  if (typeof updateAgentsList === 'function') updateAgentsList();
  if (typeof updateChannelsList === 'function') updateChannelsList();
  if (typeof updateSkillsList === 'function') updateSkillsList();
  if (typeof updateRawConfig === 'function') updateRawConfig();
  if (typeof updateDefaultModel === 'function') updateDefaultModel();
}

// ============ Initialize ============
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n
  if (window.i18n) {
    await window.i18n.init();

    // Update language toggle button text
    const toggleText = document.getElementById('lang-toggle-text');
    if (toggleText) {
      const currentLang = window.i18n.getCurrentLanguage();
      toggleText.textContent = currentLang === 'en' ? '中文' : 'English';
    }
  }

  // Try to detect OpenClaw configuration on startup
  try {
    const response = await fetch('/api/detect');
    const info = await response.json();

    if (info.configExists) {
      document.getElementById('config-path-input').value = info.configPath;
      addLog('info', `Detected OpenClaw config at ${info.configPath}`);
    } else if (info.stateDir) {
      // Set state directory as default
      const isWindows = navigator.userAgent.includes('Windows');
      const defaultPath = info.stateDir + (isWindows ? '\\openclaw.json' : '/openclaw.json');
      document.getElementById('config-path-input').value = defaultPath;
      addLog('info', `Detected state directory at ${info.stateDir}`);
    }

    if (info.version) {
      addLog('info', `OpenClaw version: ${info.version}`);
    }
  } catch (err) {
    // Fallback to default path
    const isWindows = navigator.userAgent.includes('Windows');
    const homePath = isWindows ? 'C:\\Users\\' + (navigator.userAgent.match(/Windows NT.*?;\s*(\w+)/)?.[1] || 'user') : '~';
    const defaultPath = homePath + (isWindows ? '\\.openclaw\\openclaw.json' : '/.openclaw/openclaw.json');
    document.getElementById('config-path-input').value = defaultPath.replace(/\\/g, '/');
  }

  // Add initial log
  addLog('info', 'OpenClaw Config Manager initialized');
});
