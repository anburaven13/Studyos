let state = {
  timeLeft: 25 * 60,
  mode: 'pomodoro', // pomodoro, shortBreak, stopwatch
  isRunning: false
};

const MODE_TIMES = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  stopwatch: 0
};

// Start ticking
function startTimer() {
  state.isRunning = true;
  chrome.alarms.create('timerTick', { periodInMinutes: 1/60 });
  broadcastState('stateUpdated');
  
  if (state.mode === 'pomodoro') {
    enableBlocking();
  }
}

function pauseTimer() {
  state.isRunning = false;
  chrome.alarms.clear('timerTick');
  broadcastState('stateUpdated');
  disableBlocking();
}

function resetTimer() {
  state.isRunning = false;
  chrome.alarms.clear('timerTick');
  state.timeLeft = MODE_TIMES[state.mode];
  broadcastState('stateUpdated');
  disableBlocking();
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'timerTick' && state.isRunning) {
    if (state.mode === 'stopwatch') {
      state.timeLeft++;
    } else {
      state.timeLeft--;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        pauseTimer();
        // Play sound or notification here
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==',
          title: 'StudyOS',
          message: state.mode === 'pomodoro' ? 'Focus session complete! Take a break.' : 'Break is over! Time to focus.'
        });
      }
    }
    broadcastState('tick');
  }
});

function broadcastState(action) {
  chrome.runtime.sendMessage({ action, state }).catch(() => {});
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getState') {
    sendResponse(state);
  } else if (msg.action === 'start') {
    startTimer();
  } else if (msg.action === 'pause') {
    pauseTimer();
  } else if (msg.action === 'reset') {
    resetTimer();
  } else if (msg.action === 'setMode') {
    state.mode = msg.mode;
    resetTimer();
  } else if (msg.action === 'updateBlockRules') {
    if (state.isRunning && state.mode === 'pomodoro') {
      enableBlocking();
    }
  }
  return true;
});

// Dynamic Blocking Logic using declarativeNetRequest
async function enableBlocking() {
  const data = await chrome.storage.local.get(['blocklist']);
  const blocklist = data.blocklist || [];
  
  if (blocklist.length === 0) return;

  const rules = blocklist.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: `||${domain}`,
      resourceTypes: ["main_frame"]
    }
  }));

  // Clear existing rules and add new ones
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds = existingRules.map(rule => rule.id);
  
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingIds,
    addRules: rules
  });
}

async function disableBlocking() {
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingIds = existingRules.map(rule => rule.id);
  
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingIds
  });
}
