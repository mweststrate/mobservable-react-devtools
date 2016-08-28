import Agent from '../../backend/Agent';
import Bridge from '../../backend/Bridge';

window.addEventListener('message', welcome);

function welcome(evt) {
  if (evt.data.source !== 'mobx-devtools-content-script') {
    return;
  }

  const contentScriptId = evt.data.contentScriptId;

  window.removeEventListener('message', welcome);

  setup(window.__MOBX_DEVTOOLS_GLOBAL_HOOK__, contentScriptId);
}

function setup(hook, contentScriptId) {
  var listeners = [];

  var wall = {
    listen(fn) {
      var listener = evt => {
        if (evt.data.source !== 'mobx-devtools-content-script' || !evt.data.payload || evt.data.contentScriptId !== contentScriptId) {
          return;
        }
        fn(evt.data.payload);
      };
      listeners.push(listener);
      window.addEventListener('message', listener);
    },
    send(data) {
      window.postMessage({
        source: 'mobx-devtools-bridge',
        payload: data,
      }, '*');
    },
  };

  const bridge = new Bridge(wall);

  if (!hook.agent) {
    hook.agent = new Agent(hook);
  }

  hook.agent.connect(bridge);

  hook.agent.onceShutdown(() => {
    listeners.forEach(fn => {
      window.removeEventListener('message', fn);
    });
    listeners = [];
  });
}
