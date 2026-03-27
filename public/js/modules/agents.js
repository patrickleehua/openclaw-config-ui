// Agents Module

function updateAgentsList() {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const container = document.getElementById('agents-list');
  const defaults = configData?.agents?.defaults || {};
  const agents = configData?.agents?.list || [];
  const modelParams = defaults.models || {};

  // Count configured model params
  const modelParamsCount = Object.keys(modelParams).length;

  let html = '';

  // Default Agent Section
  html += `
    <div class="mb-6">
      <h3 class="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
        Default Agent
      </h3>
      <div class="glass rounded-2xl p-5 card-hover border-2 border-accent/30">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="font-semibold text-lg flex items-center gap-2">
              Default Agent
              <span class="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">Default</span>
            </h4>
            <p class="text-sm text-gray-400">Global default configuration</p>
          </div>
          <button onclick="editDefaultAgent()" class="p-2 hover:bg-white/10 rounded-lg transition-all" title="Edit Default Agent">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div class="p-2 bg-white/5 rounded-lg">
            <span class="text-gray-400 block text-xs">Model:</span>
            <span class="truncate">${defaults.model?.primary || 'Not set'}</span>
          </div>
          <div class="p-2 bg-white/5 rounded-lg">
            <span class="text-gray-400 block text-xs">Workspace:</span>
            <span class="truncate">${defaults.workspace || 'Default'}</span>
          </div>
          <div class="p-2 bg-white/5 rounded-lg">
            <span class="text-gray-400 block text-xs">Max Concurrent:</span>
            <span>${defaults.maxConcurrent || 'Default'}</span>
          </div>
        </div>
        ${modelParamsCount > 0 ? `
        <div class="mt-4 pt-4 border-t border-white/10">
          <div class="flex justify-between items-center">
            <h5 class="text-sm text-gray-400 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Model Params
              <span class="text-xs px-1.5 py-0.5 bg-purple-500/20 text-purple-400 rounded">${modelParamsCount} configured</span>
            </h5>
            <button onclick="editModelParams()" class="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400">
              Configure
            </button>
          </div>
          <div class="mt-2 space-y-1">
            ${Object.entries(modelParams).slice(0, 3).map(([modelKey, config]) => `
              <div class="text-xs p-2 bg-white/5 rounded flex justify-between items-center">
                <span class="text-gray-300 truncate">${modelKey}</span>
                <span class="text-gray-500">${config.params ? Object.keys(config.params).length : 0} params</span>
              </div>
            `).join('')}
            ${modelParamsCount > 3 ? `<p class="text-xs text-gray-500 italic">+${modelParamsCount - 3} more...</p>` : ''}
          </div>
        </div>
        ` : `
        <div class="mt-4 pt-4 border-t border-white/10">
          <div class="flex justify-between items-center">
            <h5 class="text-sm text-gray-400 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Model Params
            </h5>
            <button onclick="editModelParams()" class="text-xs px-2 py-1 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg transition-all">
              + Add Params
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-2">Configure透传参数 for specific models (e.g., reasoning.effort, temperature)</p>
        </div>
        `}
      </div>
    </div>
  `;

  // Custom Agents Section
  html += `
    <div>
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-sm font-medium text-gray-400 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Custom Agents
        </h3>
      </div>
  `;

  if (agents.length === 0) {
    html += `
      <div class="glass rounded-2xl p-6 text-center text-gray-400">
        <p>No custom agents configured</p>
        <p class="text-xs mt-1">Click "Add Agent" to create a custom agent</p>
      </div>
    `;
  } else {
    html += agents.map(agent => `
      <div class="glass rounded-2xl p-5 card-hover mb-3">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="font-semibold text-lg flex items-center gap-2">
              ${agent.name || agent.id}
            </h4>
            <p class="text-sm text-gray-400">${agent.id}</p>
          </div>
          <div class="flex gap-2">
            <button onclick="editAgent('${agent.id}')" class="p-2 hover:bg-white/10 rounded-lg transition-all" title="Edit Agent">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button onclick="deleteAgent('${agent.id}')" class="p-2 hover:bg-primary/20 text-primary rounded-lg transition-all" title="Delete Agent">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="p-2 bg-white/5 rounded-lg">
            <span class="text-gray-400 block text-xs">Model:</span>
            <span class="truncate">${agent.model?.primary || 'Default'}</span>
          </div>
          <div class="p-2 bg-white/5 rounded-lg">
            <span class="text-gray-400 block text-xs">Workspace:</span>
            <span class="truncate">${agent.workspace || 'Default'}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  html += '</div>';
  container.innerHTML = html;
}

function _getModelOptions(selectedModel = '', includeDefault = true) {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const providers = configData?.models?.providers || {};
  let modelOptions = includeDefault ? '<option value="">Select a model</option>' : '<option value="">Use default model</option>';
  Object.entries(providers).forEach(([providerName, provider]) => {
    (provider.models || []).forEach(model => {
      const modelId = `${providerName}/${model.id}`;
      const selected = selectedModel === modelId ? 'selected' : '';
      modelOptions += `<option value="${modelId}" ${selected}>${model.name || model.id} (${providerName})</option>`;
    });
  });
  return modelOptions;
}

function editDefaultAgent() {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const defaults = configData?.agents?.defaults || {};
  const modelOptions = _getModelOptions(defaults.model?.primary || '');

  showModal('Edit Default Agent', `
    <div class="space-y-4">
      <div>
        <label class="block text-sm text-gray-400 mb-1">Primary Model</label>
        <select id="edit-default-model" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
          ${modelOptions || '<option value="">No models available</option>'}
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">Workspace</label>
        <input type="text" id="edit-default-workspace" value="${defaults.workspace || ''}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" placeholder="/path/to/workspace">
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">Max Concurrent Tasks</label>
        <input type="number" id="edit-default-maxconcurrent" value="${defaults.maxConcurrent || 4}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
      </div>
      <details class="text-sm">
        <summary class="cursor-pointer text-gray-400 hover:text-white">Advanced Settings</summary>
        <div class="mt-3 space-y-3">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Context Pruning Mode</label>
            <select id="edit-default-pruning" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm">
              <option value="cache-ttl" ${defaults.contextPruning?.mode === 'cache-ttl' ? 'selected' : ''}>Cache TTL</option>
              <option value="sliding" ${defaults.contextPruning?.mode === 'sliding' ? 'selected' : ''}>Sliding Window</option>
              <option value="disabled" ${defaults.contextPruning?.mode === 'disabled' ? 'selected' : ''}>Disabled</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Compaction Mode</label>
            <select id="edit-default-compaction" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm">
              <option value="safeguard" ${defaults.compaction?.mode === 'safeguard' ? 'selected' : ''}>Safeguard</option>
              <option value="always" ${defaults.compaction?.mode === 'always' ? 'selected' : ''}>Always</option>
              <option value="disabled" ${defaults.compaction?.mode === 'disabled' ? 'selected' : ''}>Disabled</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Max Concurrent Subagents</label>
            <input type="number" id="edit-default-subagents" value="${defaults.subagents?.maxConcurrent || 8}" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm">
          </div>
        </div>
      </details>
    </div>
  `, [
    { label: 'Save Changes', primary: true, onClick: 'saveDefaultAgent()' }
  ]);
}

async function saveDefaultAgent() {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const model = document.getElementById('edit-default-model').value.trim();
  const workspace = document.getElementById('edit-default-workspace').value.trim();
  const maxConcurrent = parseInt(document.getElementById('edit-default-maxconcurrent').value) || 4;
  const pruningMode = document.getElementById('edit-default-pruning').value;
  const compactionMode = document.getElementById('edit-default-compaction').value;
  const subagentsConcurrent = parseInt(document.getElementById('edit-default-subagents').value) || 8;

  try {
    if (!configData.agents) configData.agents = { defaults: {}, list: [] };
    if (!configData.agents.defaults) configData.agents.defaults = {};

    configData.agents.defaults = {
      ...configData.agents.defaults,
      model: model ? { primary: model } : configData.agents.defaults.model,
      workspace: workspace || undefined,
      maxConcurrent,
      contextPruning: { mode: pruningMode },
      compaction: { mode: compactionMode },
      subagents: { maxConcurrent: subagentsConcurrent }
    };

    // Remove undefined values
    Object.keys(configData.agents.defaults).forEach(key => {
      if (configData.agents.defaults[key] === undefined) {
        delete configData.agents.defaults[key];
      }
    });

    await fetch('/api/config/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });

    showToast('Default agent updated', 'success');
    closeModal();
    await reloadConfig();
  } catch (err) {
    showToast('Failed to save: ' + err.message, 'error');
  }
}

// ============ Model Params Functions ============

function _getAllModelKeys() {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const providers = configData?.models?.providers || {};
  const modelKeys = [];

  Object.entries(providers).forEach(([providerName, provider]) => {
    (provider.models || []).forEach(model => {
      modelKeys.push(`${providerName}/${model.id}`);
    });
  });

  return modelKeys.sort();
}

function editModelParams() {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const modelParams = configData?.agents?.defaults?.models || {};
  const allModelKeys = _getAllModelKeys();

  // Build existing params list
  const existingParamsHtml = Object.entries(modelParams).map(([modelKey, config]) => {
    const paramsStr = config.params ? JSON.stringify(config.params, null, 2) : '{}';
    return `
      <div class="p-3 bg-white/5 rounded-lg border border-white/10">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium">${modelKey}</span>
          <button onclick="deleteModelParams('${modelKey}')" class="text-xs text-red-400 hover:text-red-300">Remove</button>
        </div>
        <textarea id="model-params-${modelKey.replace(/[^a-zA-Z0-9]/g, '_')}" rows="3" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:border-accent text-sm code-block" placeholder='{"reasoning": {"effort": "medium"}}'>${paramsStr}</textarea>
      </div>
    `;
  }).join('');

  // Build model selector for adding new params
  const modelOptions = allModelKeys
    .filter(key => !modelParams[key])
    .map(key => `<option value="${key}">${key}</option>`)
    .join('');

  showModal('Model Params Configuration', `
    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div class="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p class="text-xs text-blue-400">
          <strong>Model Params</strong> allow you to pass extra parameters to specific models.
          These are passed through to the API request body.
        </p>
        <p class="text-xs text-blue-400 mt-1">
          Example: <code class="bg-white/10 px-1 rounded">{"reasoning": {"effort": "medium", "summary": "auto"}}</code>
        </p>
      </div>

      <div class="border-b border-white/10 pb-4">
        <h4 class="text-sm font-medium mb-3">Add New Model Params</h4>
        <div class="flex gap-2">
          <select id="new-model-key" class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
            <option value="">Select a model...</option>
            ${modelOptions}
          </select>
          <button onclick="addNewModelParam()" class="px-4 py-2 bg-accent/20 text-accent rounded-xl hover:bg-accent/30 transition-all">
            Add
          </button>
        </div>
        ${allModelKeys.length === 0 ? '<p class="text-xs text-gray-500 mt-2">No models configured. Add models in Models section first.</p>' : ''}
      </div>

      <div>
        <h4 class="text-sm font-medium mb-3">Configured Model Params</h4>
        ${existingParamsHtml || '<p class="text-sm text-gray-500 italic">No model params configured yet.</p>'}
      </div>
    </div>
  `, [
    { label: 'Save All', primary: true, onClick: 'saveModelParams()' }
  ]);
}

function addNewModelParam() {
  const modelKey = document.getElementById('new-model-key').value;
  if (!modelKey) {
    showToast('Please select a model', 'warning');
    return;
  }

  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  if (!configData.agents) configData.agents = { defaults: {}, list: [] };
  if (!configData.agents.defaults) configData.agents.defaults = {};
  if (!configData.agents.defaults.models) configData.agents.defaults.models = {};

  configData.agents.defaults.models[modelKey] = { params: {} };

  // Refresh the modal
  editModelParams();
}

async function deleteModelParams(modelKey) {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;

  if (configData.agents?.defaults?.models?.[modelKey]) {
    delete configData.agents.defaults.models[modelKey];

    // Clean up empty objects
    if (Object.keys(configData.agents.defaults.models).length === 0) {
      delete configData.agents.defaults.models;
    }

    try {
      await fetch('/api/config/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
    } catch (err) {
      console.error('Failed to save:', err);
    }
  }

  // Refresh the modal
  editModelParams();
}

async function saveModelParams() {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const modelParams = configData?.agents?.defaults?.models || {};

  // Collect all params from textareas
  const textareas = document.querySelectorAll('textarea[id^="model-params-"]');
  let hasError = false;

  textareas.forEach(textarea => {
    // Extract model key from textarea id
    const id = textarea.id.replace('model-params-', '');
    const modelKey = Object.keys(modelParams).find(key => key.replace(/[^a-zA-Z0-9]/g, '_') === id);

    if (modelKey) {
      const value = textarea.value.trim();
      if (value) {
        try {
          const params = JSON.parse(value);
          modelParams[modelKey].params = params;
        } catch (e) {
          showToast(`Invalid JSON for ${modelKey}: ${e.message}`, 'error');
          hasError = true;
        }
      } else {
        delete modelParams[modelKey];
      }
    }
  });

  if (hasError) return;

  try {
    if (!configData.agents) configData.agents = { defaults: {}, list: [] };
    if (!configData.agents.defaults) configData.agents.defaults = {};
    configData.agents.defaults.models = modelParams;

    // Clean up empty objects
    if (Object.keys(modelParams).length === 0) {
      delete configData.agents.defaults.models;
    }

    await fetch('/api/config/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configData)
    });

    showToast('Model params saved', 'success');
    closeModal();
    await reloadConfig();
  } catch (err) {
    showToast('Failed to save: ' + err.message, 'error');
  }
}

function showAddAgentModal() {
  const modelOptions = _getModelOptions('', true);

  showModal('Add Custom Agent', `
    <div class="space-y-4">
      <div>
        <label class="block text-sm text-gray-400 mb-1">Agent ID *</label>
        <input type="text" id="agent-id" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" placeholder="my-agent">
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">Name</label>
        <input type="text" id="agent-name" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" placeholder="My Agent">
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">Primary Model</label>
        <select id="agent-model" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
          ${modelOptions || '<option value="">No models available</option>'}
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">Workspace</label>
        <input type="text" id="agent-workspace" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" placeholder="/path/to/workspace">
      </div>
    </div>
  `, [
    { label: 'Add Agent', primary: true, onClick: 'addAgent()' }
  ]);
}

async function addAgent() {
  const id = document.getElementById('agent-id').value.trim();
  const name = document.getElementById('agent-name').value.trim();
  const model = document.getElementById('agent-model').value.trim();
  const workspace = document.getElementById('agent-workspace').value.trim();

  if (!id) {
    showToast('Agent ID is required', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name,
        model: model ? { primary: model } : undefined,
        workspace
      })
    });

    const result = await response.json();
    if (result.success) {
      showToast('Agent added', 'success');
      closeModal();
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to add agent: ' + err.message, 'error');
  }
}

async function deleteAgent(id) {
  if (!confirm(`Delete agent "${id}"?`)) return;

  try {
    const response = await fetch(`/api/agents/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
      showToast('Agent deleted', 'success');
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to delete: ' + err.message, 'error');
  }
}

function editAgent(id) {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const agent = configData?.agents?.list?.find(a => a.id === id);
  if (!agent) return;

  const modelOptions = _getModelOptions(agent.model?.primary || '', true);

  showModal(`Edit Agent: ${id}`, `
    <div class="space-y-4">
      <div>
        <label class="block text-sm text-gray-400 mb-1">Name</label>
        <input type="text" id="edit-agent-name" value="${agent.name || ''}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">Primary Model</label>
        <select id="edit-agent-model" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
          ${modelOptions || '<option value="">No models available</option>'}
        </select>
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">Workspace</label>
        <input type="text" id="edit-agent-workspace" value="${agent.workspace || ''}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
      </div>
    </div>
  `, [
    { label: 'Save Changes', primary: true, onClick: `saveAgent('${id}')` }
  ]);
}

async function saveAgent(id) {
  const name = document.getElementById('edit-agent-name').value.trim();
  const model = document.getElementById('edit-agent-model').value.trim();
  const workspace = document.getElementById('edit-agent-workspace').value.trim();

  try {
    const response = await fetch(`/api/agents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        model: model ? { primary: model } : undefined,
        workspace
      })
    });

    const result = await response.json();
    if (result.success) {
      showToast('Agent updated', 'success');
      closeModal();
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to save: ' + err.message, 'error');
  }
}
