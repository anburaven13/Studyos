// Study keywords to allow
const EDUCATIONAL_KEYWORDS = [
  'study', 'learn', 'tutorial', 'course', 'math', 'science', 'physics', 
  'chemistry', 'biology', 'code', 'programming', 'software', 'developer',
  'lecture', 'university', 'college', 'exam', 'preparation', 'revision',
  'history', 'literature', 'grammar', 'english', 'calculus', 'algebra',
  'focus', 'pomodoro', 'lofi', 'podcast', 'documentary', 'education'
];

const studyRegex = new RegExp(EDUCATIONAL_KEYWORDS.join('|'), 'i');
let filterEnabled = true;

chrome.storage.local.get(['ytFilterEnabled'], (res) => {
  if (res.ytFilterEnabled !== undefined) {
    filterEnabled = res.ytFilterEnabled;
  }
  if (filterEnabled) {
    startFiltering();
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.ytFilterEnabled) {
    filterEnabled = changes.ytFilterEnabled.newValue;
    if (filterEnabled) {
      startFiltering();
    } else {
      stopFiltering();
      unhideAll();
    }
  }
});

function isEducational(text) {
  return studyRegex.test(text);
}

function processTitles() {
  if (!filterEnabled) return;
  
  // Find all potential title elements on the page based on modern YouTube DOM structure
  const titles = document.querySelectorAll(
    'a.ytLockupMetadataViewModelTitle, ' + // Homepage feed, channel grids, watch sidebar
    'a#video-title'                        // Search results
  );
  
  titles.forEach(titleEl => {
    // Find the closest primary container
    const container = titleEl.closest('ytd-rich-item-renderer, yt-lockup-view-model, ytd-video-renderer, ytd-compact-video-renderer');
    if (!container) return;
    
    // If it's a lockup inside a rich item, hide the rich item to prevent empty gaps
    const topContainer = container.closest('ytd-rich-item-renderer') || container;
    
    const titleText = (titleEl.textContent || titleEl.innerText || '').trim();
    if (titleText.length === 0) return;
    
    // Try to get channel text if easily available
    const channelEl = topContainer.querySelector('.ytd-channel-name, #channel-name');
    const channelText = channelEl ? (channelEl.textContent || channelEl.innerText || '').trim() : '';
    
    const combinedText = titleText + ' ' + channelText;
    
    // Check if we've already processed this exact text
    if (topContainer.getAttribute('data-studyos-text') === combinedText) return;
    topContainer.setAttribute('data-studyos-text', combinedText);
    
    if (!isEducational(combinedText)) {
      topContainer.style.display = 'none';
      topContainer.setAttribute('data-studyos-hidden', 'true');
    } else {
      topContainer.style.display = '';
      topContainer.setAttribute('data-studyos-hidden', 'false');
    }
  });
}

function unhideAll() {
  const hiddenNodes = document.querySelectorAll('[data-studyos-hidden="true"]');
  hiddenNodes.forEach(node => {
    node.style.display = '';
    node.removeAttribute('data-studyos-hidden');
    node.removeAttribute('data-studyos-text');
  });
}

let intervalId = null;

function startFiltering() {
  // Using setInterval is the most robust way to handle YouTube's SPA architecture
  // because MutationObserver can get extremely complicated with Polymer's shadow DOM updates.
  if (intervalId) return;
  processTitles(); // run immediately
  intervalId = setInterval(processTitles, 1000); // Check every 1 second
}

function stopFiltering() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
