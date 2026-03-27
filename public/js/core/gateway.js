// Gateway Control Module

let gatewayStatus = 'stopped';

async function startGateway() {
  try {
    const response = await fetch('/api/gateway/start', { method: 'POST' });
    const result = await response.json();
    if (result.success) {
      showToast('Gateway starting...', 'success');
      updateGatewayStatus(result.status);
      addLog('info', 'Gateway started');
    }
  } catch (err) {
    showToast('Failed to start gateway: ' + err.message, 'error');
  }
}

async function stopGateway() {
  try {
    const response = await fetch('/api/gateway/stop', { method: 'POST' });
    const result = await response.json();
    if (result.success) {
      showToast('Gateway stopped', 'success');
      updateGatewayStatus(result.status);
      addLog('info', 'Gateway stopped');
    }
  } catch (err) {
    showToast('Failed to stop gateway: ' + err.message, 'error');
  }
}

async function restartGateway() {
  try {
    const response = await fetch('/api/gateway/restart', { method: 'POST' });
    const result = await response.json();
    if (result.success) {
      showToast('Gateway restarting...', 'success');
      updateGatewayStatus(result.status);
      addLog('info', 'Gateway restarted');
    }
  } catch (err) {
    showToast('Failed to restart gateway: ' + err.message, 'error');
  }
}

function updateGatewayStatus(status) {
  gatewayStatus = status;
  const statusText = document.getElementById('gateway-status-text');
  const detailStatus = document.getElementById('gateway-detail-status');
  const statusDot = document.querySelector('.status-dot');

  statusText.textContent = status === 'running' ? 'Running' : 'Stopped';
  detailStatus.textContent = status === 'running' ? 'Gateway is running' : 'Not running';

  statusDot.classList.remove('running', 'stopped');
  statusDot.classList.add(status);
}
