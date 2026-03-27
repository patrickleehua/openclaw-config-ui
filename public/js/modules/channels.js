// Channels Module

const AVAILABLE_CHANNELS = [
  { key: 'telegram', name: 'Telegram', icon: '📱', description: 'Telegram Bot API' },
  { key: 'discord', name: 'Discord', icon: '💬', description: 'Discord Bot Gateway' },
  { key: 'slack', name: 'Slack', icon: '💼', description: 'Slack App Integration' },
  { key: 'whatsapp', name: 'WhatsApp', icon: '📞', description: 'WhatsApp Business API' },
  { key: 'signal', name: 'Signal', icon: '🔒', description: 'Signal CLI Integration' },
  { key: 'imessage', name: 'iMessage', icon: '💬', description: 'Apple iMessage' },
  { key: 'irc', name: 'IRC', icon: '📡', description: 'IRC Protocol' },
  { key: 'googlechat', name: 'Google Chat', icon: '🗨️', description: 'Google Chat Webhook' },
  { key: 'msteams', name: 'MS Teams', icon: '👥', description: 'Microsoft Teams Bot' }
];

function updateChannelsList() {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const container = document.getElementById('channels-list');
  const channels = configData?.channels || {};

  // Get configured channels
  const configuredChannels = Object.keys(channels).filter(k => channels[k] && Object.keys(channels[k]).length > 0);

  let html = '';

  if (configuredChannels.length === 0) {
    html += `
      <div class="col-span-full glass rounded-2xl p-8 text-center text-gray-400">
        <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <p>No channels configured</p>
        <p class="text-xs mt-1">Click "Add Channel" to configure a communication channel</p>
      </div>
    `;
  } else {
    // Show only configured channels
    configuredChannels.forEach(key => {
      const channelDef = AVAILABLE_CHANNELS.find(c => c.key === key) || { name: key, icon: '📡', description: 'Custom Channel' };
      const config = channels[key];
      const enabled = config.enabled !== false;

      html += `
        <div class="glass rounded-2xl p-5 card-hover">
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${channelDef.icon}</span>
              <div>
                <h4 class="font-semibold">${channelDef.name}</h4>
                <p class="text-sm ${enabled ? 'text-green-400' : 'text-gray-400'}">${enabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" ${enabled ? 'checked' : ''} onchange="toggleChannel('${key}', this.checked)" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-600 peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          <div class="flex justify-between items-center">
            <p class="text-xs text-gray-500">${channelDef.description}</p>
            <div class="flex gap-2">
              <button onclick="editChannel('${key}')" class="text-sm text-accent hover:text-accent/80 transition-all">
                Configure
              </button>
              <button onclick="deleteChannel('${key}')" class="text-sm text-primary hover:text-primary/80 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = html;
}

function showAddChannelModal() {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const channels = configData?.channels || {};
  const configuredKeys = Object.keys(channels).filter(k => channels[k] && Object.keys(channels[k]).length > 0);

  // Filter out already configured channels
  const availableChannels = AVAILABLE_CHANNELS.filter(c => !configuredKeys.includes(c.key));

  if (availableChannels.length === 0) {
    showToast('All channels are already configured', 'info');
    return;
  }

  const channelOptions = availableChannels.map(ch =>
    `<option value="${ch.key}">${ch.icon} ${ch.name} - ${ch.description}</option>`
  ).join('');

  showModal('Add Channel', `
    <div class="space-y-4">
      <div>
        <label class="block text-sm text-gray-400 mb-1">Select Channel Type</label>
        <select id="channel-type" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
          ${channelOptions}
        </select>
      </div>
      <div>
        <label class="flex items-center gap-2">
          <input type="checkbox" id="channel-enabled" checked class="rounded">
          <span class="text-sm text-gray-400">Enable immediately</span>
        </label>
      </div>
      <details class="text-sm">
        <summary class="cursor-pointer text-gray-400 hover:text-white">Custom Channel (advanced)</summary>
        <div class="mt-3">
          <label class="block text-xs text-gray-500 mb-1">Custom Channel Key</label>
          <input type="text" id="custom-channel-key" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm" placeholder="my-custom-channel">
        </div>
      </details>
    </div>
  `, [
    { label: 'Add Channel', primary: true, onClick: 'addChannel()' }
  ]);
}

async function addChannel() {
  let channelKey = document.getElementById('channel-type').value;
  const customKey = document.getElementById('custom-channel-key').value.trim();
  const enabled = document.getElementById('channel-enabled').checked;

  if (customKey) {
    channelKey = customKey;
  }

  if (!channelKey) {
    showToast('Please select a channel type', 'warning');
    return;
  }

  try {
    const response = await fetch(`/api/channels/${channelKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    });

    const result = await response.json();
    if (result.success) {
      showToast('Channel added', 'success');
      closeModal();
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to add channel: ' + err.message, 'error');
  }
}

async function deleteChannel(key) {
  if (!confirm(`Delete channel "${key}"? This will remove all configuration for this channel.`)) return;

  try {
    const response = await fetch(`/api/channels/${key}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
      showToast('Channel deleted', 'success');
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to delete: ' + err.message, 'error');
  }
}

async function toggleChannel(key, enabled) {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  try {
    const currentConfig = configData?.channels?.[key] || {};
    const response = await fetch(`/api/channels/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...currentConfig, enabled })
    });

    const result = await response.json();
    if (result.success) {
      showToast(`${key} ${enabled ? 'enabled' : 'disabled'}`, 'success');
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to update: ' + err.message, 'error');
  }
}

function editChannel(key) {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const config = configData?.channels?.[key] || {};
  const configJson = JSON.stringify(config, null, 2);

  showModal(`Edit ${key} Channel`, `
    <div class="space-y-4">
      <p class="text-sm text-gray-400">Edit the raw JSON configuration for this channel.</p>
      <textarea id="channel-config" rows="10" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent code-block text-sm">${configJson}</textarea>
    </div>
  `, [
    { label: 'Save', primary: true, onClick: `saveChannel('${key}')` }
  ]);
}

async function saveChannel(key) {
  try {
    const config = JSON.parse(document.getElementById('channel-config').value);
    const response = await fetch(`/api/channels/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    const result = await response.json();
    if (result.success) {
      showToast('Channel updated', 'success');
      closeModal();
      await reloadConfig();
    }
  } catch (err) {
    showToast('Invalid JSON: ' + err.message, 'error');
  }
}
