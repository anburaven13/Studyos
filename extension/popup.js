const timeDisplay = document.getElementById('time-display');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const modeBtns = document.querySelectorAll('.mode-btn');

// Timer state
let state = {
  timeLeft: 25 * 60,
  mode: 'pomodoro',
  isRunning: false
};

// UI updates
function formatTime(seconds) {
  if (state.mode === 'stopwatch') {
    // For stopwatch, it counts up, but we can treat timeLeft as elapsed time
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateDisplay() {
  timeDisplay.textContent = formatTime(state.timeLeft);
  if (state.isRunning) {
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
  } else {
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
  }
}

// Sync with background
function syncState() {
  chrome.runtime.sendMessage({ action: 'getState' }, (res) => {
    if (res) {
      state = res;
      updateDisplay();
      // Update active mode button
      modeBtns.forEach(btn => {
        if (btn.dataset.mode === state.mode) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  });
}

// Listen for updates from background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'tick' || msg.action === 'stateUpdated') {
    state = msg.state;
    updateDisplay();
  }
});

// Controls
startBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'start' });
});

pauseBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'pause' });
});

resetBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'reset' });
});

modeBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const mode = e.target.dataset.mode;
    chrome.runtime.sendMessage({ action: 'setMode', mode });
  });
});

// Tab switching logic
const tabBtns = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.view');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    views.forEach(v => v.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// Blocker Logic
const urlInput = document.getElementById('url-input');
const addUrlBtn = document.getElementById('add-url-btn');
const blockedList = document.getElementById('blocked-list');
const ytFilterToggle = document.getElementById('yt-filter-toggle');

function renderBlocklist(list) {
  blockedList.innerHTML = '';
  list.forEach((domain, index) => {
    const li = document.createElement('li');
    li.textContent = domain;
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '✕';
    removeBtn.onclick = () => {
      list.splice(index, 1);
      chrome.storage.local.set({ blocklist: list }, () => renderBlocklist(list));
      chrome.runtime.sendMessage({ action: 'updateBlockRules' });
    };
    li.appendChild(removeBtn);
    blockedList.appendChild(li);
  });
}

// Init Blocker UI
chrome.storage.local.get(['blocklist', 'ytFilterEnabled'], (res) => {
  const list = res.blocklist || [];
  renderBlocklist(list);

  if (res.ytFilterEnabled !== undefined) {
    ytFilterToggle.checked = res.ytFilterEnabled;
  }
});

addUrlBtn.addEventListener('click', () => {
  const url = urlInput.value.trim().toLowerCase();
  if (!url) return;
  // Clean domain (remove http/www)
  const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
  
  chrome.storage.local.get(['blocklist'], (res) => {
    const list = res.blocklist || [];
    if (!list.includes(domain)) {
      list.push(domain);
      chrome.storage.local.set({ blocklist: list }, () => {
        renderBlocklist(list);
        urlInput.value = '';
        chrome.runtime.sendMessage({ action: 'updateBlockRules' });
      });
    }
  });
});

ytFilterToggle.addEventListener('change', (e) => {
  chrome.storage.local.set({ ytFilterEnabled: e.target.checked });
});

// Initial sync
syncState();
