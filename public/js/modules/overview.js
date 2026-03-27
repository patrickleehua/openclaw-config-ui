// Overview Module

function updateOverview() {
  const configData = window.ConfigModule?.getConfigData?.() || configData;
  if (!configData) return;

  // Stats
  const providers = configData?.models?.providers || {};
  const modelCount = Object.values(providers).reduce((sum, p) => sum + (p.models?.length || 0), 0);
  document.getElementById('stat-models').textContent = modelCount;

  const agents = configData?.agents?.list || [];
  document.getElementById('stat-agents').textContent = agents.length;

  const channels = configData?.channels || {};
  const channelCount = Object.keys(channels).filter(k => channels[k]?.enabled).length;
  document.getElementById('stat-channels').textContent = channelCount;

  const skills = configData?.skills?.entries || {};
  const skillCount = Object.keys(skills).filter(k => skills[k]?.enabled !== false).length;
  document.getElementById('stat-skills').textContent = skillCount;

  // Config info
  document.getElementById('config-version').textContent = configData?.meta?.lastTouchedVersion || '-';
  document.getElementById('config-modified').textContent = configData?.meta?.lastTouchedAt
    ? new Date(configData.meta.lastTouchedAt).toLocaleString()
    : '-';
  document.getElementById('config-auth-mode').textContent = configData?.gateway?.auth?.mode || 'token';
  document.getElementById('config-update-channel').textContent = configData?.update?.channel || 'stable';
  document.getElementById('gateway-port').textContent = configData?.gateway?.port || '18789';
}

async function updateDefaultModel() {
  try {
    const response = await fetch('/api/default-model');
    const result = await response.json();
    document.getElementById('default-model-display').textContent = result.model || 'Not set';
  } catch (err) {
    console.error('Failed to fetch default model:', err);
  }
}
