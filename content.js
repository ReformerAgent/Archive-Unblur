// Global counters and toast settings
let totalDecensored = 0;
let showToastNotifications = true;
let lastToastTime = 0;
const TOAST_DEBOUNCE_MS = 1000;

// Load settings from storage
chrome.storage.local.get(['totalDecensored', 'showToastNotifications'], (data) => {
  totalDecensored = data.totalDecensored || 0;
  showToastNotifications = data.showToastNotifications !== false; // Default to true
});

function showToast(message, duration = 2000) {
  if (!showToastNotifications) return;

  const now = Date.now();
  if (now - lastToastTime < TOAST_DEBOUNCE_MS) {
    return; // Debounce - don't show toast if one was shown recently
  }
  lastToastTime = now;

  // Remove any existing toast first
  const existingToast = document.querySelector('.archive-unblur-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'archive-unblur-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 128, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-family: Arial, sans-serif;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  `;
  document.body.appendChild(toast);

  // Fade in
  setTimeout(() => toast.style.opacity = '1', 10);

  // Fade out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function saveTotalDecensored() {
  chrome.storage.local.set({ totalDecensored });
}

console.log("Archive Unblur Extension loaded");

// Graceful fade functions
function fadeOutBlur(img) {
  // Add transition if not already present
  if (!img.style.transition) {
    img.style.transition = 'filter 0.3s ease-out';
  }

  // Remove blur class and any blur filter
  img.classList.remove('blur');
  img.style.filter = img.style.filter.replace(/blur\([^)]*\)/g, '').trim();
  if (img.style.filter === '') {
    img.style.removeProperty('filter');
  }
}

function fadeOutElement(element) {
  // Add transition for smooth fade
  element.style.transition = 'opacity 0.3s ease-out';
  element.style.opacity = '0';

  // Remove element after fade completes
  setTimeout(() => {
    if (element.parentNode) {
      element.remove();
    }
  }, 300);
}

function checkAndModifyElements() {

  let totalUnblurred = 0;

  // Method 1: Direct approach - look for images with blur class anywhere in document
  const blurredImages = document.querySelectorAll('img.blur');
  blurredImages.forEach(img => {
    fadeOutBlur(img);
    totalUnblurred++;
  });

  // Method 2: Look for drop-shadow containers with blurred images
  const dropShadowContainers = document.querySelectorAll('.drop-shadow');
  dropShadowContainers.forEach(container => {
    const img = container.querySelector('img.blur');
    if (img) {
      fadeOutBlur(img);
      totalUnblurred++;
    }

    // Also check for any child elements that might be overlays
    const overlays = container.querySelectorAll('[class*="overlay"], [class*="inappropriate"]');
    overlays.forEach(overlay => fadeOutElement(overlay));
  });

  // Method 3: Remove text overlays and inappropriate content warnings
  const textOverlays = document.querySelectorAll('text-overlay, [class*="inappropriate"], [class*="overlay"]');
  textOverlays.forEach(overlay => fadeOutElement(overlay));

  // Method 4: Look for elements with "content may be inappropriate" text
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    if (element.textContent && element.textContent.toLowerCase().includes('content may be inappropriate')) {
      fadeOutElement(element);
    }
  });

  // Method 5: Improved shadow DOM traversal with multiple fallback strategies
  try {
    // Strategy A: Original deep traversal
    traverseShadowDOM(document.querySelector('app-root'));

    // Strategy B: Look for any shadow roots that contain images
    findAndFixImagesInShadowRoots(document.body);

  } catch (error) {
    console.log("Error in shadow DOM traversal:", error);
  }

  // Update global counter and show toast notification if we unblurred any images
  if (totalUnblurred > 0) {
    totalDecensored += totalUnblurred;
    saveTotalDecensored();
    showToast(`🔓 ${totalDecensored} items de-censored`);
  }

  function traverseShadowDOM(root) {
    if (!root) return;

    // If this element has a shadow root, traverse it
    if (root.shadowRoot) {
      processShadowRoot(root.shadowRoot);
      traverseShadowDOM(root.shadowRoot);
    }

    // Traverse child elements
    if (root.children) {
      Array.from(root.children).forEach(child => traverseShadowDOM(child));
    }
  }

  function processShadowRoot(shadow) {
    // Look for images with blur class in this shadow root
    const blurredImgs = shadow.querySelectorAll('img.blur');
    blurredImgs.forEach(img => {
      fadeOutBlur(img);
      totalUnblurred++;
    });

    // Remove text overlays
    const overlays = shadow.querySelectorAll('text-overlay, [class*="overlay"], [class*="inappropriate"]');
    overlays.forEach(overlay => fadeOutElement(overlay));
  }

  function findAndFixImagesInShadowRoots(root) {
    // Recursively search all elements for shadow roots
    const allElements = root.querySelectorAll('*');
    allElements.forEach(element => {
      if (element.shadowRoot) {
        processShadowRoot(element.shadowRoot);
        // Also search within the shadow root
        findAndFixImagesInShadowRoots(element.shadowRoot);
      }
    });
  }
}

// Global variable to store interval IDs
let checkInterval = null;

// Listen for messages to enable or disable the script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);
  if (request.scriptEnabled !== undefined) {
    if (request.scriptEnabled) {
      console.log("Script enabled via message");
      // Initial check
      checkAndModifyElements();
      // Periodic check - store the interval ID
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      checkInterval = setInterval(() => {
        checkAndModifyElements();
      }, 1000);
    } else {
      console.log("Script disabled via message");
      // Clear the specific interval
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    }
  }

  if (request.showToastNotifications !== undefined) {
    showToastNotifications = request.showToastNotifications;
    console.log("Toast notifications preference updated:", showToastNotifications);
  }
});

// Always run initially for testing, then respect toggle state
console.log("Running initial check regardless of toggle state");
checkAndModifyElements();

// Run a few more checks quickly in case content loads progressively
setTimeout(() => checkAndModifyElements(), 2000);
setTimeout(() => checkAndModifyElements(), 5000);

// Initial state check for toggle functionality
chrome.storage.local.get('scriptEnabled', (data) => {
  console.log("Toggle state from storage:", data.scriptEnabled);
  if (data.scriptEnabled) {
    console.log("Starting periodic checks");
    if (checkInterval) {
      clearInterval(checkInterval);
    }
    checkInterval = setInterval(() => {
      checkAndModifyElements();
    }, 1000);
  } else {
    console.log("Toggle is disabled, not starting periodic checks");
  }
});
