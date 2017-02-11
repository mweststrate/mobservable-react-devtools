/* global chrome */

import React from 'react';
import ReactDOM from 'react-dom';

import Loader from '../../Loader';
import RichPanel from '../../components/RichPanel';

const node = document.getElementById('container');

let loaderConfig;

function render() {
  ReactDOM.render(<Loader {...loaderConfig}><RichPanel /></Loader>, node);
}

loaderConfig = {
  debugName: 'Panel UI',
  reload: () => {
    ReactDOM.unmountComponentAtNode(node);
    node.innerHTML = '';
    render();
  },
  reloadSubscribe: (reloadFn) => {
    chrome.devtools.network.onNavigated.addListener(reloadFn);
    return () => chrome.devtools.network.onNavigated.removeListener(reloadFn);
  },
  inject: (done) => {
    const code = `
    // the prototype stuff is in case document.createElement has been modified
    var script = document.constructor.prototype.createElement.call(document, 'script');
    script.src = "${chrome.runtime.getURL('build/backend.js')}";
    document.documentElement.appendChild(script);
    script.parentNode.removeChild(script);
    `;
    chrome.devtools.inspectedWindow.eval(code, (res, err) => {
      if (err) {
        console.log(err); // eslint-disable-line no-console
        return;
      }

      let disconnected = false;

      const port = chrome.runtime.connect({
        name: `${chrome.devtools.inspectedWindow.tabId}`,
      });

      port.onDisconnect.addListener(() => {
        disconnected = true;
      });

      const wall = {
        listen(fn) {
          port.onMessage.addListener(message => fn(message));
        },
        send(data) {
          if (disconnected) {
            return;
          }
          try {
            port.postMessage(data);
          } catch (e) {
            console.warn(e); // eslint-disable-line no-console
          }
        },
      };

      done(wall, () => port.disconnect());
    });
  },
};

render();

