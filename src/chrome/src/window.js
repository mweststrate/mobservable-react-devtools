/* global chrome */

var React = require('react');
var ReactDOM = require('react-dom');

import Loader from '../../Loader';
import RichPanel from '../../components/RichPanel';

var node = document.getElementById('container');

var disconnectListeners = {};

chrome.runtime.getBackgroundPage(({ contentTabId }) => {
  let onDisconnect;
  const loaderConfig = {
    debugName: 'Window UI',
    reload: () => {
      ReactDOM.unmountComponentAtNode(node);
      node.innerHTML = '';
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === contentTabId && changeInfo.status === 'complete') {
          render();
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    },
    reloadSubscribe: reloadFn => {
      onDisconnect = reloadFn;
      return () => { onDisconnect = undefined; };
    },
    inject: done => {
      var code = `
      // the prototype stuff is in case document.createElement has been modified
      var script = document.constructor.prototype.createElement.call(document, 'script');
      script.src = "${chrome.runtime.getURL('build/backend.js')}";
      document.documentElement.appendChild(script);
      script.parentNode.removeChild(script);
      `;
      chrome.tabs.executeScript(contentTabId, { code }, () => {
        let disconnected = false;

        const port = chrome.runtime.connect({
          name: '' + contentTabId,
        });

        port.onDisconnect.addListener(() => {
          disconnected = true;
          if (onDisconnect) { onDisconnect(); }
        });

        const wall = {
          listen(fn) {
            port.onMessage.addListener(message => fn(message));
          },
          send(data) {
            if (disconnected) {
              return;
            }
            port.postMessage(data);
          },
        };
        done(wall, () => port.disconnect());
      });
    }
  };

  function render() {
    ReactDOM.render(<Loader {...loaderConfig}><RichPanel /></Loader>, node);
  }

  render();
});
