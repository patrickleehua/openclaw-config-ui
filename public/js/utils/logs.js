// Logs Module

const logs = [];
let currentLogPath = null;

// ============ UI Log Functions ============
function addLog(level, message) {
  const timestamp = new Date().toISOString();
  logs.push({ level, message, timestamp });

  const container = document.getElementById('logs-container');
  const levelColors = {
    info: 'text-accent',
    warn: 'text-yellow-400',
    error: 'text-primary',
    success: 'text-green-400'
  };

  const logHtml = `
    <div class="flex gap-3 py-1 border-b border-white/5">
      <span class="text-gray-500 text-xs w-24 flex-shrink-0">${new Date(timestamp).toLocaleTimeString()}</span>
      <span class="${levelColors[level] || 'text-gray-400'} text-xs w-12 flex-shrink-0">[${level.toUpperCase()}]</span>
      <span class="text-gray-300">${message}</span>
    </div>
  `;

  if (logs.length === 1) {
    container.innerHTML = logHtml;
  } else {
    container.insertAdjacentHTML('beforeend', logHtml);
  }

  container.scrollTop = container.scrollHeight;
}

function clearLogs() {
  logs.length = 0;
  document.getElementById('logs-container').innerHTML = '<p class="text-gray-400">No logs to display</p>';
  showToast('Logs cleared', 'info');
}

// ============ System File Picker Handler ============
function handleLogFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  currentLogPath = file.name;
  document.getElementById('log-path-input').value = file.name;

  // Read file content directly using FileReader
  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    displayLogContent(content, file.name, file.size);
  };
  reader.onerror = function() {
    showToast('Failed to read file', 'error');
  };
  reader.readAsText(file);

  // Reset the input so the same file can be selected again
  event.target.value = '';
}

function displayLogContent(content, fileName, fileSize) {
  const container = document.getElementById('logs-container');
  container.innerHTML = '';

  // Update path display
  const currentPathEl = document.getElementById('current-log-path');
  if (currentPathEl) {
    currentPathEl.textContent = fileName;
    document.getElementById('current-log-display').classList.remove('hidden');
  }

  // Update info
  const infoEl = document.getElementById('log-file-info');
  if (infoEl) {
    const lines = content.split('\n');
    infoEl.textContent = `${lines.length} lines | ${(fileSize / 1024).toFixed(2)} KB`;
  }

  if (!content || content.trim() === '') {
    container.innerHTML = '<p class="text-gray-400">Log file is empty</p>';
    return;
  }

  // Render log lines (limit to last 1000 lines for performance)
  const lines = content.split('\n');
  const displayLines = lines.slice(-1000);

  displayLines.forEach((line, index) => {
    const lineHtml = `
      <div class="flex gap-3 py-1 border-b border-white/5 hover:bg-white/5">
        <span class="text-gray-500 text-xs w-12 flex-shrink-0">${index + 1}</span>
        <span class="text-gray-300 text-sm font-mono whitespace-pre-wrap">${escapeHtml(line)}</span>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', lineHtml);
  });

  container.scrollTop = container.scrollHeight;
  showToast(`Loaded ${displayLines.length} log lines`, 'success');
}

// ============ External Log File Functions (via server API) ============
async function selectLogFile() {
  const pathInput = document.getElementById('log-path-input');
  const logPath = pathInput.value.trim();

  if (!logPath) {
    showToast('Please enter a log file path', 'warning');
    return;
  }

  currentLogPath = logPath;
  await loadExternalLogs();
}

async function loadExternalLogs() {
  if (!currentLogPath) {
    showToast('No log file path set', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/logs/read-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: currentLogPath, lines: 500 })
    });

    const result = await response.json();

    if (result.error) {
      showToast(result.error, 'error');
      return;
    }

    // Display external logs
    const container = document.getElementById('logs-container');
    container.innerHTML = '';

    // Update path display
    const currentPathEl = document.getElementById('current-log-path');
    if (currentPathEl) {
      currentPathEl.textContent = currentLogPath;
      document.getElementById('current-log-display').classList.remove('hidden');
    }

    // Update info
    const infoEl = document.getElementById('log-file-info');
    if (infoEl) {
      infoEl.textContent = `${result.lines?.length || 0} lines | ${(result.fileSize / 1024).toFixed(2)} KB | Modified: ${new Date(result.lastModified).toLocaleString()}`;
    }

    if (!result.lines || result.lines.length === 0) {
      container.innerHTML = '<p class="text-gray-400">Log file is empty</p>';
      return;
    }

    // Render log lines
    result.lines.forEach((line, index) => {
      const lineHtml = `
        <div class="flex gap-3 py-1 border-b border-white/5 hover:bg-white/5">
          <span class="text-gray-500 text-xs w-12 flex-shrink-0">${index + 1}</span>
          <span class="text-gray-300 text-sm font-mono whitespace-pre-wrap">${escapeHtml(line)}</span>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', lineHtml);
    });

    container.scrollTop = container.scrollHeight;
    showToast(`Loaded ${result.lines.length} log lines`, 'success');

  } catch (err) {
    showToast('Failed to load log file: ' + err.message, 'error');
  }
}

async function listLogFiles() {
  const pathInput = document.getElementById('log-path-input');
  let logPath = pathInput.value.trim();

  // If no path entered, try to detect default logs directory
  if (!logPath) {
    try {
      const detectResponse = await fetch('/api/detect');
      const detectInfo = await detectResponse.json();

      if (detectInfo.stateDir) {
        // Use state directory as default
        const isWindows = navigator.userAgent.includes('Windows');
        logPath = detectInfo.stateDir + (isWindows ? '\\logs' : '/logs');
        pathInput.value = logPath;
      } else {
        // Fallback to home directory
        const homeDir = detectInfo.homeDir || (navigator.userAgent.includes('Windows') ? 'C:\\Users' : '~');
        const isWindows = navigator.userAgent.includes('Windows');
        logPath = homeDir + (isWindows ? '\\.openclaw\\logs' : '/.openclaw/logs');
        pathInput.value = logPath;
      }
    } catch {
      showToast('Please enter a directory path', 'warning');
      return;
    }
  }

  // If path looks like a file (has extension), extract directory
  let dirPath = logPath;
  const lastSlash = Math.max(logPath.lastIndexOf('/'), logPath.lastIndexOf('\\'));
  const lastDot = logPath.lastIndexOf('.');

  // If has extension and the dot is after the last slash, treat as file
  if (lastDot > lastSlash && lastDot !== -1) {
    dirPath = logPath.substring(0, lastSlash);
  }

  try {
    const response = await fetch('/api/logs/list-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: dirPath })
    });

    const result = await response.json();

    if (result.error) {
      showToast(result.error, 'error');
      return;
    }

    if (!result.files || result.files.length === 0) {
      showToast('No log files found in directory', 'info');
      return;
    }

    // Show file selection dialog
    showLogFileSelector(result.files, dirPath);

  } catch (err) {
    showToast('Failed to list log files: ' + err.message, 'error');
  }
}

function showLogFileSelector(files, dirPath) {
  const fileListHtml = files.map(f => `
    <button onclick="selectLogFileFromList('${f.path}')" class="w-full text-left px-3 py-2 hover:bg-white/10 rounded-lg transition-all flex items-center gap-2">
      <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      <span class="text-sm">${f.name}</span>
    </button>
  `).join('');

  showModal('Select Log File', `
    <div class="space-y-2 max-h-80 overflow-y-auto">
      <p class="text-sm text-gray-400 mb-3">Directory: ${dirPath}</p>
      ${fileListHtml}
    </div>
  `, [
    { label: 'Cancel', class: 'bg-white/10 hover:bg-white/20' }
  ]);
}

function selectLogFileFromList(filePath) {
  document.getElementById('log-path-input').value = filePath;
  currentLogPath = filePath;
  closeModal();
  loadExternalLogs();
}

function escapeHtml(text) {
  const div = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => div[m]);
}

// Export for module usage
window.LogsModule = {
  addLog,
  clearLogs,
  handleLogFileSelect,
  selectLogFile,
  loadExternalLogs,
  listLogFiles,
  selectLogFileFromList
};
