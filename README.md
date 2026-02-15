# Archive-Unblur
Chrome Extension for removing the preview blur in titles marked inappropriate on archive.org

## Features
- **Automatic De-censoring**: Removes blur effects and "content may be inappropriate" overlays from archive.org images
- **Smart Detection**: Works with both regular DOM elements and shadow DOM content
- **Real-time Processing**: Continuously monitors for newly loaded content as you scroll
- **Toast Notifications**: Shows discreet notifications when content is de-censored (optional)
- **Running Tally**: Tracks total number of items de-censored across sessions
- **User Controls**: Toggle de-censoring and notifications on/off

## Installation Instructions

### Download
- Download as zip (by tapping on the green code button above)
- Extract the file
- The folder `Archive-Unblur` will contain all the files

### Chrome Installation
1. Open Chrome and go to `chrome://extensions/`
2. Toggle "Developer mode" from top-right
3. Click "Load unpacked" on top-left
4. Navigate to and select the `Archive-Unblur` folder
5. The extension will be loaded

### Other Browsers
Same steps apply for browsers like Opera GX, Edge, etc.

## Usage

### Basic Operation
1. Visit archive.org (search results, details pages, or labs)
2. The extension automatically detects and removes blur effects
3. Green toast notifications appear when content is de-censored

### Extension Popup Controls
Click the Archive Unblur extension icon to access:
- **Disable Censor**: Turn de-censoring on/off
- **Show Notifications**: Enable/disable toast notifications
- **Statistics**: View total items de-censored

### Advanced Features
- **Persistent Counter**: Tracks your total impact across browsing sessions
- **Debounced Notifications**: Prevents notification spam
- **Shadow DOM Support**: Handles modern web components
- **Dynamic Content**: Processes content loaded via AJAX/infinite scroll

## Technical Details
- Uses content scripts to monitor DOM changes
- Processes both CSS `blur` classes and `filter: blur()` styles
- Removes `text-overlay` elements containing inappropriate warnings
- Stores settings in Chrome local storage
- Compatible with Manifest V3
