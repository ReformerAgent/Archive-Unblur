// Initialize the script state on install
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed, setting initial state');
    chrome.storage.local.set({ scriptEnabled: true });
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    if (request.scriptEnabled !== undefined) {
        chrome.storage.local.set({ scriptEnabled: request.scriptEnabled }, () => {
            console.log('Background saved scriptEnabled:', request.scriptEnabled);
        });
    }
});
  