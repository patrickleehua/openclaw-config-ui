// Models Module

function updateModelsList() {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const container = document.getElementById('models-list');
  const providers = configData?.models?.providers || {};

  if (Object.keys(providers).length === 0) {
    container.innerHTML = `
      <div class="glass rounded-2xl p-8 text-center text-gray-400">
        <p>No model providers configured</p>
      </div>
    `;
    return;
  }

  container.innerHTML = Object.entries(providers).map(([name, provider]) => `
    <div class="glass rounded-2xl p-5 card-hover">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h4 class="font-semibold text-lg">${name}</h4>
          <p class="text-sm text-gray-400">${provider.baseUrl || 'No base URL'} · ${provider.api || 'unknown'}</p>
        </div>
        <div class="flex gap-2">
          <button onclick="editProvider('${name}')" class="p-2 hover:bg-white/10 rounded-lg transition-all" title="Edit Provider">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button onclick="deleteProvider('${name}')" class="p-2 hover:bg-primary/20 text-primary rounded-lg transition-all" title="Delete Provider">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-400">Models: <span class="text-white">${provider.models?.length || 0}</span></p>
          <button onclick="showAddModelModal('${name}')" class="text-xs px-2 py-1 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-all">
            + Add Model
          </button>
        </div>
        <div class="mt-3 space-y-2">
          ${provider.models?.map((m, idx) => `
            <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg group">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <div class="w-2 h-2 rounded-full ${m.reasoning ? 'bg-purple-400' : 'bg-accent'} flex-shrink-0"></div>
                <span class="truncate">${m.name || m.id}</span>
                <span class="text-xs text-gray-500 flex-shrink-0">${(m.contextWindow || 0).toLocaleString()} ctx</span>
                ${m.reasoning ? '<span class="text-xs px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded flex-shrink-0">reasoning</span>' : ''}
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="editModel('${name}', ${idx})" class="p-1 hover:bg-white/10 rounded transition-all" title="Edit Model">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button onclick="deleteModel('${name}', ${idx})" class="p-1 hover:bg-primary/20 text-primary rounded transition-all" title="Delete Model">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          `).join('') || '<p class="text-xs text-gray-500 italic">No models configured</p>'}
        </div>
      </div>
    </div>
  `).join('');
}

function showAddProviderDialog() {
  showModal('Add Model Provider', `
    <div class="space-y-4">
      <div>
        <label class="block text-sm text-gray-400 mb-1">Provider Name</label>
        <input type="text" id="provider-name" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" placeholder="e.g., openai, anthropic">
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">Base URL</label>
        <input type="text" id="provider-baseurl" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" placeholder="https://api.example.com/v1">
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">API Key (optional)</label>
        <input type="text" id="provider-apikey" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" placeholder="sk-...">
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">API Type</label>
        <select id="provider-api" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
          <option value="anthropic-messages">Anthropic Messages</option>
          <option value="openai-completions">OpenAI Completions</option>
          <option value="openai-responses">OpenAI Responses</option>
          <option value="google-generative-ai">Google Generative AI</option>
          <option value="ollama">Ollama</option>
        </select>
      </div>
    </div>
  `, [
    { label: 'Add Provider', primary: true, onClick: 'addProvider()' }
  ]);
}

async function addProvider() {
  const name = document.getElementById('provider-name').value.trim();
  const baseUrl = document.getElementById('provider-baseurl').value.trim();
  const apiKey = document.getElementById('provider-apikey').value.trim();
  const api = document.getElementById('provider-api').value;

  if (!name || !baseUrl) {
    showToast('Name and Base URL are required', 'warning');
    return;
  }

  try {
    const response = await fetch(`/api/models/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl, apiKey: apiKey || undefined, api, models: [] })
    });

    const result = await response.json();
    if (result.success) {
      showToast('Provider added', 'success');
      closeModal();
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to add provider: ' + err.message, 'error');
  }
}

async function deleteProvider(name) {
  if (!confirm(`Delete provider "${name}"?`)) return;

  try {
    const response = await fetch(`/api/models/${name}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
      showToast('Provider deleted', 'success');
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to delete: ' + err.message, 'error');
  }
}

function editProvider(name) {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const provider = configData?.models?.providers?.[name];
  if (!provider) return;

  showModal(`Edit Provider: ${name}`, `
    <div class="space-y-4">
      <div>
        <label class="block text-sm text-gray-400 mb-1">Base URL</label>
        <input type="text" id="edit-provider-baseurl" value="${provider.baseUrl || ''}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">API Key</label>
        <input type="text" id="edit-provider-apikey" value="${provider.apiKey || ''}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">API Type</label>
        <select id="edit-provider-api" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
          <option value="anthropic-messages" ${provider.api === 'anthropic-messages' ? 'selected' : ''}>Anthropic Messages</option>
          <option value="openai-completions" ${provider.api === 'openai-completions' ? 'selected' : ''}>OpenAI Completions</option>
          <option value="openai-responses" ${provider.api === 'openai-responses' ? 'selected' : ''}>OpenAI Responses</option>
          <option value="google-generative-ai" ${provider.api === 'google-generative-ai' ? 'selected' : ''}>Google Generative AI</option>
          <option value="ollama" ${provider.api === 'ollama' ? 'selected' : ''}>Ollama</option>
        </select>
      </div>
    </div>
  `, [
    { label: 'Save Changes', primary: true, onClick: `saveProvider('${name}')` }
  ]);
}

async function saveProvider(name) {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const baseUrl = document.getElementById('edit-provider-baseurl').value.trim();
  const apiKey = document.getElementById('edit-provider-apikey').value.trim();
  const api = document.getElementById('edit-provider-api').value;

  try {
    const response = await fetch(`/api/models/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...configData.models.providers[name],
        baseUrl,
        apiKey: apiKey || undefined,
        api
      })
    });

    const result = await response.json();
    if (result.success) {
      showToast('Provider updated', 'success');
      closeModal();
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to save: ' + err.message, 'error');
  }
}

// Model CRUD within provider
function showAddModelModal(providerName) {
  showModal(`Add Model to ${providerName}`, `
    <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-400 mb-1">Model ID *</label>
          <input type="text" id="model-id" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" placeholder="claude-sonnet-4-6">
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1">Display Name</label>
          <input type="text" id="model-name" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" placeholder="Claude Sonnet 4.6">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-400 mb-1">Context Window</label>
          <input type="number" id="model-context" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" placeholder="200000">
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1">Max Tokens</label>
          <input type="number" id="model-maxtokens" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent" placeholder="65536">
        </div>
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">Input Types</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2">
            <input type="checkbox" id="model-input-text" checked class="rounded">
            <span class="text-sm">text</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="model-input-image" class="rounded">
            <span class="text-sm">image</span>
          </label>
        </div>
      </div>
      <div>
        <label class="flex items-center gap-2">
          <input type="checkbox" id="model-reasoning" class="rounded">
          <span class="text-sm text-gray-400">Reasoning Model (extended thinking)</span>
        </label>
      </div>
      <details class="text-sm">
        <summary class="cursor-pointer text-gray-400 hover:text-white">Cost Configuration (optional)</summary>
        <div class="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Input Cost ($/1M tokens)</label>
            <input type="number" step="0.01" id="model-cost-input" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm" placeholder="0">
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Output Cost ($/1M tokens)</label>
            <input type="number" step="0.01" id="model-cost-output" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm" placeholder="0">
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Cache Read ($/1M tokens)</label>
            <input type="number" step="0.01" id="model-cost-cache-read" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm" placeholder="0">
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Cache Write ($/1M tokens)</label>
            <input type="number" step="0.01" id="model-cost-cache-write" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm" placeholder="0">
          </div>
        </div>
      </details>
      <details class="text-sm">
        <summary class="cursor-pointer text-gray-400 hover:text-white">模型参数透传 (params)</summary>
        <div class="mt-3 space-y-3">
          <div class="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p class="text-xs text-yellow-400">
              <strong>注意：</strong>模型级别的 extraBody 已弃用。请在 Agents → Default Agent → Model Params 中配置透传参数。
            </p>
          </div>
          <p class="text-xs text-gray-500">
            透传参数需要配置在 <code class="bg-white/10 px-1 rounded">agents.defaults.models["provider/model-id"].params</code> 路径下。
          </p>
        </div>
      </details>
    </div>
  `, [
    { label: 'Add Model', primary: true, onClick: `addModel('${providerName}')` }
  ]);
}

async function addModel(providerName) {
  const id = document.getElementById('model-id').value.trim();
  const name = document.getElementById('model-name').value.trim();
  const contextWindow = parseInt(document.getElementById('model-context').value) || 200000;
  const maxTokens = parseInt(document.getElementById('model-maxtokens').value) || 4096;
  const reasoning = document.getElementById('model-reasoning').checked;
  const inputText = document.getElementById('model-input-text').checked;
  const inputImage = document.getElementById('model-input-image').checked;

  if (!id) {
    showToast('Model ID is required', 'warning');
    return;
  }

  const input = [];
  if (inputText) input.push('text');
  if (inputImage) input.push('image');

  const costInput = parseFloat(document.getElementById('model-cost-input').value) || 0;
  const costOutput = parseFloat(document.getElementById('model-cost-output').value) || 0;
  const costCacheRead = parseFloat(document.getElementById('model-cost-cache-read').value) || 0;
  const costCacheWrite = parseFloat(document.getElementById('model-cost-cache-write').value) || 0;

  const modelData = {
    id,
    name: name || id,
    contextWindow,
    maxTokens,
    reasoning,
    input,
    cost: { input: costInput, output: costOutput, cacheRead: costCacheRead, cacheWrite: costCacheWrite }
  };

  try {
    const response = await fetch(`/api/models/${providerName}/models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modelData)
    });

    const result = await response.json();
    if (result.success) {
      showToast('Model added', 'success');
      closeModal();
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to add model: ' + err.message, 'error');
  }
}

function editModel(providerName, modelIndex) {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const model = configData?.models?.providers?.[providerName]?.models?.[modelIndex];
  if (!model) return;

  const input = model.input || ['text'];
  const hasText = input.includes('text');
  const hasImage = input.includes('image');
  const cost = model.cost || {};

  showModal(`Edit Model: ${model.name || model.id}`, `
    <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-400 mb-1">Model ID *</label>
          <input type="text" id="edit-model-id" value="${model.id || ''}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1">Display Name</label>
          <input type="text" id="edit-model-name" value="${model.name || ''}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-gray-400 mb-1">Context Window</label>
          <input type="number" id="edit-model-context" value="${model.contextWindow || 200000}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1">Max Tokens</label>
          <input type="number" id="edit-model-maxtokens" value="${model.maxTokens || 4096}" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-accent">
        </div>
      </div>
      <div>
        <label class="block text-sm text-gray-400 mb-1">Input Types</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2">
            <input type="checkbox" id="edit-model-input-text" ${hasText ? 'checked' : ''} class="rounded">
            <span class="text-sm">text</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="edit-model-input-image" ${hasImage ? 'checked' : ''} class="rounded">
            <span class="text-sm">image</span>
          </label>
        </div>
      </div>
      <div>
        <label class="flex items-center gap-2">
          <input type="checkbox" id="edit-model-reasoning" ${model.reasoning ? 'checked' : ''} class="rounded">
          <span class="text-sm text-gray-400">Reasoning Model (extended thinking)</span>
        </label>
      </div>
      <details class="text-sm">
        <summary class="cursor-pointer text-gray-400 hover:text-white">Cost Configuration</summary>
        <div class="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-gray-500 mb-1">Input Cost ($/1M tokens)</label>
            <input type="number" step="0.01" id="edit-model-cost-input" value="${cost.input || 0}" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm">
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Output Cost ($/1M tokens)</label>
            <input type="number" step="0.01" id="edit-model-cost-output" value="${cost.output || 0}" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm">
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Cache Read ($/1M tokens)</label>
            <input type="number" step="0.01" id="edit-model-cost-cache-read" value="${cost.cacheRead || 0}" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm">
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">Cache Write ($/1M tokens)</label>
            <input type="number" step="0.01" id="edit-model-cost-cache-write" value="${cost.cacheWrite || 0}" class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent text-sm">
          </div>
        </div>
      </details>
      <details class="text-sm">
        <summary class="cursor-pointer text-gray-400 hover:text-white">模型参数透传 (params)</summary>
        <div class="mt-3 space-y-3">
          <div class="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p class="text-xs text-yellow-400">
              <strong>注意：</strong>模型级别的 extraBody 已弃用。请在 Agents → Default Agent → Model Params 中配置透传参数。
            </p>
          </div>
          <p class="text-xs text-gray-500">
            透传参数需要配置在 <code class="bg-white/10 px-1 rounded">agents.defaults.models["${providerName}/${model.id}"].params</code> 路径下。
          </p>
        </div>
      </details>
    </div>
  `, [
    { label: 'Save Changes', primary: true, onClick: `saveModel('${providerName}', ${modelIndex})` }
  ]);
}

async function saveModel(providerName, modelIndex) {
  const id = document.getElementById('edit-model-id').value.trim();
  const name = document.getElementById('edit-model-name').value.trim();
  const contextWindow = parseInt(document.getElementById('edit-model-context').value) || 200000;
  const maxTokens = parseInt(document.getElementById('edit-model-maxtokens').value) || 4096;
  const reasoning = document.getElementById('edit-model-reasoning').checked;
  const inputText = document.getElementById('edit-model-input-text').checked;
  const inputImage = document.getElementById('edit-model-input-image').checked;

  if (!id) {
    showToast('Model ID is required', 'warning');
    return;
  }

  const input = [];
  if (inputText) input.push('text');
  if (inputImage) input.push('image');

  const costInput = parseFloat(document.getElementById('edit-model-cost-input').value) || 0;
  const costOutput = parseFloat(document.getElementById('edit-model-cost-output').value) || 0;
  const costCacheRead = parseFloat(document.getElementById('edit-model-cost-cache-read').value) || 0;
  const costCacheWrite = parseFloat(document.getElementById('edit-model-cost-cache-write').value) || 0;

  const modelData = {
    id,
    name: name || id,
    contextWindow,
    maxTokens,
    reasoning,
    input,
    cost: { input: costInput, output: costOutput, cacheRead: costCacheRead, cacheWrite: costCacheWrite }
  };

  try {
    const response = await fetch(`/api/models/${providerName}/models/${modelIndex}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modelData)
    });

    const result = await response.json();
    if (result.success) {
      showToast('Model updated', 'success');
      closeModal();
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to save model: ' + err.message, 'error');
  }
}

async function deleteModel(providerName, modelIndex) {
  const configData = window.ConfigModule?.getConfigData?.() || window.configData;
  const model = configData?.models?.providers?.[providerName]?.models?.[modelIndex];
  if (!model) return;

  if (!confirm(`Delete model "${model.name || model.id}"?`)) return;

  try {
    const response = await fetch(`/api/models/${providerName}/models/${modelIndex}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
      showToast('Model deleted', 'success');
      await reloadConfig();
    }
  } catch (err) {
    showToast('Failed to delete model: ' + err.message, 'error');
  }
}
