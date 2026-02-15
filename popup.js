document.addEventListener('DOMContentLoaded', () => {
    console.log('Popup loaded');
    const toggleSwitch = document.getElementById('myonoffswitch');
    const toastToggle = document.getElementById('toastToggle');
    const statsDiv = document.getElementById('stats');

    // Load all settings from storage
    chrome.storage.local.get(['scriptEnabled', 'showToastNotifications', 'totalDecensored'], (data) => {
      console.log('Loaded settings:', data);

      // Set censor toggle
      if (data.scriptEnabled) {
        toggleSwitch.checked = true;
      } else {
        toggleSwitch.checked = false;
      }

      // Set toast toggle
      if (data.showToastNotifications !== false) { // Default to true
        toastToggle.checked = true;
      } else {
        toastToggle.checked = false;
      }

      // Show stats
      const total = data.totalDecensored || 0;
      statsDiv.textContent = `${total} items de-censored`;
    });

    // Censor toggle event listener
    toggleSwitch.addEventListener('change', () => {
      const newState = toggleSwitch.checked;
      console.log('Censor toggle changed to:', newState);
      chrome.storage.local.set({ scriptEnabled: newState }, () => {
        console.log('Saved censor toggle state to storage');
        // Send message to content script to enable/disable the script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            console.log('Sending message to tab:', tabs[0].id);
            chrome.tabs.sendMessage(tabs[0].id, { scriptEnabled: newState }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
              } else {
                console.log('Message sent successfully');
              }
            });
          } else {
            console.error('No active tab found');
          }
        });
      });
    });

    // Toast toggle event listener
    toastToggle.addEventListener('change', () => {
      const newState = toastToggle.checked;
      console.log('Toast toggle changed to:', newState);
      chrome.storage.local.set({ showToastNotifications: newState }, () => {
        console.log('Saved toast toggle state to storage');
        // Send message to content script to update toast preference
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { showToastNotifications: newState }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('Error sending toast message:', chrome.runtime.lastError);
              } else {
                console.log('Toast preference message sent successfully');
              }
            });
          }
        });
      });
    });
  });
  