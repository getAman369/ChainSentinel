const API_BASE = '/api/v1';

const riskLabels = {
  1: { label: 'Minimal', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  2: { label: 'Low', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  3: { label: 'Medium', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  4: { label: 'High', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  5: { label: 'Critical', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
};

function showToast(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto cursor-pointer rounded-lg px-4 py-3 mb-2 shadow-lg max-w-sm w-full text-sm font-medium transition-all duration-300 toast-enter`;

  const typeClasses = {
    info: 'bg-blue-600 text-white',
    success: 'bg-green-600 text-white',
    warning: 'bg-yellow-600 text-gray-900',
    error: 'bg-red-600 text-white',
  };
  toast.className += ' ' + (typeClasses[type] || typeClasses.info);

  toast.innerHTML = `
    <div class="flex items-center">
      <span class="flex-1">${message}</span>
      <button type="button" class="ml-3 text-current hover:opacity-70 focus:outline-none" onclick="this.parentElement.parentElement.remove()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;

  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  return toast;
}

function showSuccess(message) {
  return showToast(message, 'success');
}

function showError(message) {
  return showToast(message, 'error');
}

function showWarning(message) {
  return showToast(message, 'warning');
}

function showInfo(message) {
  return showToast(message, 'info');
}

function formatAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const original = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('bg-green-600');
    setTimeout(() => {
      button.textContent = original;
      button.classList.remove('bg-green-600');
    }, 2000);
  }).catch(() => {
    button.textContent = 'Failed';
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 2000);
  });
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  
  return data;
}

async function screenAddress(address, txHash, chainId) {
  return apiRequest('/screen', {
    method: 'POST',
    body: JSON.stringify({ address, txHash, chainId })
  });
}

async function getAttestations(address) {
  return apiRequest(`/attestations/${address}`);
}

async function checkHealth() {
  return apiRequest('/health', { base: '' });
}

function validateAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

function hideError(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    el.classList.add('hidden');
  }
}

function setLoading(isLoading) {
  const submitBtn = document.getElementById('screen-submit');
  const submitText = document.getElementById('submit-text');
  const spinner = document.getElementById('submit-spinner');
  
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitText.textContent = 'Screening...';
      spinner.classList.remove('hidden');
    } else {
      submitText.textContent = 'Screen Address';
      spinner.classList.add('hidden');
    }
  }
}

function displayResults(data) {
  const resultsSection = document.getElementById('results');
  const resultsContent = document.getElementById('results-content');
  const risk = riskLabels[data.riskScore] || { label: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  
  resultsContent.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div class="md:col-span-2">
        <div class="flex items-center gap-4 mb-4">
          <span class="text-3xl font-mono text-gray-900 dark:text-white">${data.address}</span>
          <button onclick="copyToClipboard('${data.address}', this)" class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Copy</button>
        </div>
        <div class="flex items-center gap-4 flex-wrap">
          <span class="px-4 py-2 rounded-full text-sm font-semibold ${risk.class}">${risk.label} (${data.riskScore}/5)</span>
          <span class="px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">${(data.confidence * 100).toFixed(1)}% Confidence</span>
        </div>
      </div>
      <div class="text-right md:text-left">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Network</p>
        <p class="font-mono text-sm">${data.chainId === 8453 ? 'Base Mainnet' : 'Base Sepolia'}</p>
      </div>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Evidence Hash</p>
        <div class="flex items-center gap-2">
          <code class="text-xs font-mono text-gray-900 dark:text-white break-all flex-1">${data.evidenceHash}</code>
          <button onclick="copyToClipboard('${data.evidenceHash}', this)" class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Copy</button>
        </div>
      </div>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Attestation ID</p>
        <div class="flex items-center gap-2">
          <code class="text-xs font-mono text-gray-900 dark:text-white">${data.attestationId}</code>
          <button onclick="copyToClipboard('${data.attestationId}', this)" class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Copy</button>
        </div>
      </div>
      <div>
        <p class="text-sm text-gray-500 dark:text-gray-400">Transaction</p>
        <div class="flex items-center gap-2">
          <a href="https://sepolia.basescan.org/tx/${data.attestationTx}" target="_blank" rel="noopener noreferrer" class="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex-1 truncate">${formatAddress(data.attestationTx)}</a>
          <button onclick="copyToClipboard('${data.attestationTx}', this)" class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Copy</button>
        </div>
      </div>
    </div>
    
    <div class="text-sm text-gray-500 dark:text-gray-400">
      Screened at: ${new Date(data.timestamp).toLocaleString()}
    </div>
  `;
  
  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function displayHistory(attestations) {
  const tbody = document.getElementById('history-body');
  
  if (!attestations || attestations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No attestations found for this address.</td></tr>';
    return;
  }
  
  tbody.innerHTML = attestations.map(att => {
    const risk = riskLabels[att.riskScore] || { label: 'Unknown', class: 'bg-gray-100 text-gray-800' };
    const statusClass = att.valid ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    const statusText = att.valid ? 'Valid' : 'Revoked';
    
    return `
      <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <code class="text-sm font-mono text-gray-900 dark:text-white">${formatAddress(att.address)}</code>
            <button onclick="copyToClipboard('${att.address}', this)" class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Copy</button>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="px-3 py-1 rounded-full text-xs font-semibold ${risk.class}">${att.riskScore}/5</span>
        </td>
        <td class="px-6 py-4 font-medium">${risk.label}</td>
        <td class="px-6 py-4">
          <code class="text-sm font-mono text-gray-900 dark:text-white">${att.attestationId}</code>
        </td>
        <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">${formatDate(att.timestamp)}</td>
        <td class="px-6 py-4">
          <span class="px-3 py-1 rounded-full text-xs font-medium ${statusClass}">${statusText}</span>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadHistory(address) {
  try {
    const data = await getAttestations(address);
    displayHistory(data.attestations || []);
  } catch (error) {
    console.error('Failed to load history:', error);
    const tbody = document.getElementById('history-body');
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-12 text-center text-red-600 dark:text-red-400">Failed to load history. Please try again.</td></tr>';
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
  
  document.documentElement.classList.toggle('dark', isDark);
  updateThemeIcons(isDark);
}

function updateThemeIcons(isDark) {
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  
  if (sunIcon && moonIcon) {
    sunIcon.classList.toggle('hidden', !isDark);
    sunIcon.classList.toggle('block', isDark);
    moonIcon.classList.toggle('hidden', isDark);
    moonIcon.classList.toggle('block', !isDark);
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcons(isDark);
}

const MAX_HISTORY = 10;

function saveAddressToHistory(address) {
  let history = JSON.parse(localStorage.getItem('addressHistory') || '[]');
  history = history.filter(a => a !== address);
  history.unshift(address);
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  localStorage.setItem('addressHistory', JSON.stringify(history));
}

function loadAddressHistory() {
  return JSON.parse(localStorage.getItem('addressHistory') || '[]');
}

function showAddressSuggestions(input, suggestions) {
  let dropdown = document.getElementById('address-suggestions');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'address-suggestions';
    dropdown.className = 'absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto hidden';
    input.parentNode.appendChild(dropdown);
  }

  if (!suggestions.length) {
    dropdown.classList.add('hidden');
    return;
  }

  dropdown.innerHTML = suggestions.map(addr =>
    `<button type="button" onclick="selectAddress('${addr}')" class="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-mono">${addr}</button>`
  ).join('');
  dropdown.classList.remove('hidden');
}

function hideAddressSuggestions() {
  const dropdown = document.getElementById('address-suggestions');
  if (dropdown) dropdown.classList.add('hidden');
}

function selectAddress(address) {
  const input = document.getElementById('address');
  input.value = address;
  hideAddressSuggestions();
}

function initForm() {
  const form = document.getElementById('screen-form');
  const addressInput = document.getElementById('address');

  const history = loadAddressHistory();
  if (history.length > 0 && addressInput.value === '') {
    addressInput.setAttribute('list', 'address-history');
    let datalist = document.getElementById('address-history');
    if (!datalist) {
      datalist = document.createElement('datalist');
      datalist.id = 'address-history';
      document.body.appendChild(datalist);
    }
    history.forEach(addr => {
      const option = document.createElement('option');
      option.value = addr;
      datalist.appendChild(option);
    });
  }

  addressInput.addEventListener('input', () => {
    hideError('address-error');
    const value = addressInput.value.toLowerCase();
    if (value.length > 2) {
      const history = loadAddressHistory();
      const filtered = history.filter(addr => addr.includes(value));
      showAddressSuggestions(addressInput, filtered);
    } else {
      hideAddressSuggestions();
    }
  });

  document.addEventListener('click', (e) => {
    if (!addressInput.contains(e.target)) {
      hideAddressSuggestions();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const address = addressInput.value.trim().toLowerCase();
    const txHash = document.getElementById('txHash').value.trim() || null;
    const chainId = parseInt(document.getElementById('chainId').value);

    if (!validateAddress(address)) {
      showError('address-error', 'Please enter a valid Ethereum address (0x followed by 40 hex characters)');
      addressInput.focus();
      return;
    }

    hideError('address-error');
    hideAddressSuggestions();
    saveAddressToHistory(address);
    setLoading(true);

    try {
      const result = await screenAddress(address, txHash, chainId);
      displayResults(result);
      loadHistory(address);
      showSuccess('Address screened successfully');
    } catch (error) {
      console.error('Screening failed:', error);
      showError('address-error', error.message || 'Failed to screen address. Please try again.');
    } finally {
      setLoading(false);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initForm();
  
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
  
  checkHealth().then(data => {
    console.log('API Health:', data);
  }).catch(err => {
    console.warn('Health check failed:', err);
  });
});