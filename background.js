chrome.runtime.onInstalled.addListener(() => {
    // Initialize the script state
    chrome.storage.local.set({ scriptEnabled: true });
  });
  
  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.scriptEnabled !== undefined) {
      chrome.storage.local.set({ scriptEnabled: request.scriptEnabled });
    }
  });
  