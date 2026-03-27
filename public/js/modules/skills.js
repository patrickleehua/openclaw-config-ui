// Skills Module

function updateSkillsList() {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const container = document.getElementById('skills-list');
  const skills = configData?.skills?.entries || {};

  if (Object.keys(skills).length === 0) {
    container.innerHTML = `
      <div class="glass rounded-2xl p-8 text-center text-gray-400">
        <p>No skills configured</p>
      </div>
    `;
    return;
  }

  container.innerHTML = Object.entries(skills).map(([name, config]) => {
    const enabled = config.enabled !== false;
    return `
      <div class="glass rounded-2xl p-5 card-hover flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl ${enabled ? 'bg-accent/20' : 'bg-gray-600/20'} flex items-center justify-center">
            <svg class="w-5 h-5 ${enabled ? 'text-accent' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <h4 class="font-semibold">${name}</h4>
            <p class="text-sm text-gray-400">${enabled ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" ${enabled ? 'checked' : ''} onchange="toggleSkill('${name}', this.checked)" class="sr-only peer">
          <div class="w-11 h-6 bg-gray-600 peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
        </label>
      </div>
    `;
  }).join('');
}

async function toggleSkill(name, enabled) {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  try {
    if (!configData.skills) configData.skills = { entries: {} };
    if (!configData.skills.entries) configData.skills.entries = {};

    configData.skills.entries[name] = {
      ...configData.skills.entries[name],
      enabled
    };

    const response = await fetch('/api/skills', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData.skills)
    });

    const result = await response.json();
    if (result.success) {
      showToast(`${name} ${enabled ? 'enabled' : 'disabled'}`, 'success');
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to update: ' + err.message, 'error');
  }
}
