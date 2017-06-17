/* global chrome */

const contentScriptId = Math.random().toString(32).slice(2);

// proxy from main page to devtools (via the background page)
const port = chrome.runtime.connect({
  name: 'content-script',
});

function handleMessageFromDevtools(message) {
  window.postMessage({
    source: 'mobx-devtools-content-script',
    payload: message,
    contentScriptId,
  }, '*');
}

function handleMessageFromPage(evt) {
  if (evt.data && evt.data.source === 'mobx-devtools-bridge') {
    // console.log('page -> rep -> dev', evt.data);
    port.postMessage(evt.data.payload);
  }
}

function handleDisconnect() {
  window.removeEventListener('message', handleMessageFromPage);
  window.postMessage({
    source: 'mobx-devtools-content-script',
    payload: {
      type: 'event',
      evt: 'disconnect',
    },
    contentScriptId,
  }, '*');
}

port.onMessage.addListener(handleMessageFromDevtools);
port.onDisconnect.addListener(handleDisconnect);
window.addEventListener('message', handleMessageFromPage);

window.postMessage({
  source: 'mobx-devtools-content-script',
  contentScriptId,
}, '*');
