/* global chrome */

var ports = {};

function getActiveContentWindow(cb) {
  chrome.tabs.query({ active:true, windowType:"normal", currentWindow: true }, function(d) {
    if (d.length > 0) {
      cb(d[0]);
    }
  });
}

function openWindow(contentTabId) {
  let options = {
    type: 'popup',
    url: chrome.extension.getURL('window.html' + '#' + 'window'),
    width: 350,
    height: window.screen.availHeight,
    top: 0,
    left: window.screen.availWidth - 300,
  };
  chrome.windows.create(options, win => {
    function listener(tabId) {
      if (tabId === contentTabId) {
        chrome.tabs.onRemoved.removeListener(listener);
        chrome.windows.remove(win.id);
      }
    }
    chrome.tabs.onRemoved.addListener(listener);
  });
}

chrome.contextMenus.onClicked.addListener(({ menuItemId }, contentWindow) => {
  openWindow(contentWindow.id);
});

chrome.commands.onCommand.addListener(shortcut => {
  if (shortcut === 'open-devtools-window') {
    getActiveContentWindow(contentWindow => {
      window.contentTabId = contentWindow.id;
      openWindow(contentWindow.id);
    })
  }
});

chrome.browserAction.onClicked.addListener(tab => {
  window.contentTabId = tab.id;
  openWindow(tab.id);
});

chrome.runtime.onInstalled.addListener(function(port) {
  chrome.contextMenus.create({
    id: '123',
    title: 'Open dev',
    contexts: ['all']
  });
});

chrome.runtime.onConnect.addListener(function(port) {
  var tab = null;
  var name = null;
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

function isNumeric(str: string): boolean {
  return +str + '' === str;
}

function installContentScript(tabId: number) {
  chrome.tabs.executeScript(tabId, {file: '/build/contentScript.js'}, function() {});
}


function doublePipe(one, two) {
  if (!one._i) (one._i = Math.random().toString(32).slice(2));
  if (!two._i) (two._i = Math.random().toString(32).slice(2));
  console.log(`doublePipe ${one.name} <-> ${two.name} [${one._i} <-> ${two._i}]`);
  one.onMessage.addListener(lOne);
  function lOne(message) {
    // console.log('dv -> rep', message);
    two.postMessage(message);
  }
  two.onMessage.addListener(lTwo);
  function lTwo(message) {
    // console.log('rep -> dv', message);
    one.postMessage(message);
  }
  function shutdown() {
    console.log(`shutdown ${one.name} <-> ${two.name} [${one._i} <-> ${two._i}]`);
    one.onMessage.removeListener(lOne);
    two.onMessage.removeListener(lTwo);
    one.disconnect();
    two.disconnect();
  }
  one.onDisconnect.addListener(shutdown);
  two.onDisconnect.addListener(shutdown);
}
