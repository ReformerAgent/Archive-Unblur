console.log("Content script has started execution");

function checkAndModifyElements() {
  const appRoot = document.querySelector('app-root');
  if(appRoot)
  {var shadow = appRoot.shadowRoot;
  const main = shadow.querySelector('main');
  const colPage = main.querySelector('router-slot').firstChild;
  if(colPage.shadowRoot === null){
    shadow = colPage.children[0].shadowRoot;
   
  }
  else{
    shadow = colPage.shadowRoot;
  }
  const browserCol = shadow.querySelector('collection-browser');

  shadow = browserCol.shadowRoot;
  const scroller = shadow.querySelector('infinite-scroller');
  shadow = scroller.shadowRoot;

  const container = shadow.querySelector('#container')

  if(container){
    const articles = container.querySelectorAll('article');
    articles.forEach(article =>{
      const tileDispatcher = article.querySelector('tile-dispatcher');

      if(tileDispatcher){
        //console.log(tileDispatcher.shadowRoot);
        if( tileDispatcher.shadowRoot.querySelector('a')){
          const anchor = tileDispatcher.shadowRoot.querySelector('a');
          
          if(anchor.querySelector('item-tile')){
            const gridDiv = anchor.querySelector('item-tile').shadowRoot.querySelector('image-block').shadowRoot.querySelector('.grid');
            const textOverlay = gridDiv.querySelector('text-overlay');
            const itemImage = gridDiv.querySelector('item-image');
            if(itemImage){
              if(itemImage.shadowRoot){
                if(itemImage.shadowRoot.querySelector('img')){
                  //console.log(itemImage.shadowRoot.querySelector('img').classList);
                  itemImage.shadowRoot.querySelector('img').classList.value = 'contain';
                }
              }
            }
            if (textOverlay) {
              textOverlay.remove();
            }

          }
          
        }
        
      }
      
    })
  }}





}

// Listen for messages to enable or disable the script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.scriptEnabled !== undefined) {
    if (request.scriptEnabled) {
      console.log("Script enabled");
      // Initial check
      checkAndModifyElements();
      // Periodic check
      setInterval(() => {
        console.log("Checking every second");
        checkAndModifyElements();
      }, 1000);
    } else {
      console.log("Script disabled");
      // Clear the intervals if the script is disabled
      const highestIntervalId = setInterval(() => {}, 1000); // Dummy interval to get the highest ID
      for (let i = 0; i <= highestIntervalId; i++) {
        clearInterval(i);
      }
    }
  }
});

// Initial state check
chrome.storage.local.get('scriptEnabled', (data) => {
  if (data.scriptEnabled) {
    checkAndModifyElements();
    setInterval(() => {
      console.log("Checking every second");
      checkAndModifyElements();
    }, 1000);
  }
});