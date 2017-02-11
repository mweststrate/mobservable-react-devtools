/* global chrome */

const ports = {};

function getActiveContentWindow(cb) {
  chrome.tabs.query({ active: true, windowType: 'normal', currentWindow: true }, (d) => {
    if (d.length > 0) {
      cb(d[0]);
    }
  });
}

function openWindow(contentTabId) {
  const options = {
    type: 'popup',
    url: chrome.extension.getURL('window.html#window'),
    width: 350,
    height: window.screen.availHeight,
    top: 0,
    left: window.screen.availWidth - 300,
  };
  chrome.windows.create(options, (win) => {
    function listener(tabId) {
      if (tabId === contentTabId) {
        chrome.tabs.onRemoved.removeListener(listener);
        chrome.windows.remove(win.id);
      }
    }
    chrome.tabs.onRemoved.addListener(listener);
  });
}

function isNumeric(str: string): boolean {
  return `${+str}` === str;
}

function installContentScript(tabId: number) {
  chrome.tabs.executeScript(tabId, { file: '/build/contentScript.js' }, () => {});
}

function doublePipe(one, two) {
  if (!one.$i) (one.$i = Math.random().toString(32).slice(2));
  if (!two.$i) (two.$i = Math.random().toString(32).slice(2));
  // console.log(`doublePipe ${one.name} <-> ${two.name} [${one.$i} <-> ${two.$i}]`);
  function lOne(message) {
    // console.log('dv -> rep', message);
    two.postMessage(message);
  }
  function lTwo(message) {
    // console.log('rep -> dv', message);
    one.postMessage(message);
  }
  one.onMessage.addListener(lOne);
  two.onMessage.addListener(lTwo);
  function shutdown() {
    // console.log(`shutdown ${one.name} <-> ${two.name} [${one.$i} <-> ${two.$i}]`);
    one.onMessage.removeListener(lOne);
    two.onMessage.removeListener(lTwo);
    one.disconnect();
    two.disconnect();
  }
  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);
}

chrome.contextMenus.onClicked.addListener(({ menuItemId }, contentWindow) => {
  openWindow(contentWindow.id);
});

chrome.commands.onCommand.addListener((shortcut) => {
  if (shortcut === 'open-devtools-window') {
    getActiveContentWindow((contentWindow) => {
      window.contentTabId = contentWindow.id;
      openWindow(contentWindow.id);
    });
  }
});

chrome.browserAction.onClicked.addListener((tab) => {
  window.contentTabId = tab.id;
  openWindow(tab.id);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: '123',
    title: 'Open Mobx DevTools',
    contexts: ['all'],
  });
});

chrome.runtime.onConnect.addListener((port) => {
  let tab = null;
  let name = null;
  if (isNumeric(port.name)) {
    tab = port.name;
    name = 'devtools';
    installContentScript(+port.name);
  } else {
    tab = port.sender.tab.id;
    name = 'content-script';
  }

  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      'content-script': null,
    };
  }
  ports[tab][name] = port;

  if (ports[tab].devtools && ports[tab]['content-script']) {
    doublePipe(ports[tab].devtools, ports[tab]['content-script']);
    ports[tab].devtools = null;
    ports[tab]['content-script'] = null;
  }
});

