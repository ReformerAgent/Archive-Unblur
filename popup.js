document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('myonoffswitch');
  
    // Load the current state from storage
    chrome.storage.local.get('scriptEnabled', (data) => {
      if (data.scriptEnabled) {
        toggleSwitch.checked = true;
      } else {
        toggleSwitch.checked = false;
      }
    });
  
    // Add change event listener
    toggleSwitch.addEventListener('change', () => {
      const newState = toggleSwitch.checked;
      chrome.storage.local.set({ scriptEnabled: newState }, () => {
        // Send message to content script to enable/disable the script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id, { scriptEnabled: newState });
        });
      });
    });
  });
  