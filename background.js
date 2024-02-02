chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'setServerEndpoint') {
      chrome.storage.sync.set({ serverEndpoint: message.endpoint }, () => {
        sendResponse({ status: 'success' });
      });
    } else if (message.action === 'getServerEndpoint') {
      chrome.storage.sync.get({ serverEndpoint: 'http://your-default-endpoint/upload' }, result => {
        sendResponse({ endpoint: result.serverEndpoint });
      });
    }
    return true; // Needed to keep the message channel open
  });

  chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
      url: chrome.runtime.getURL("popup.html"),
      type: "popup",
      width: 800,
      height: 660
    });
  });