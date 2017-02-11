import Agent from '../../backend/Agent_';
import Bridge from '../../backend/Bridge';

function setup(hook, contentScriptId) {
  let listeners = [];

  const wall = {
    listen(fn) {
      const listener = (evt) => {
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
    listeners.forEach((fn) => {
      window.removeEventListener('message', fn);
    });
    listeners = [];
  });
}

function welcome(evt) {
  if (evt.data.source !== 'mobx-devtools-content-script') {
    return;
  }

  const contentScriptId = evt.data.contentScriptId;

  window.removeEventListener('message', welcome);

  // eslint-disable-next-line no-underscore-dangle
  setup(window.__MOBX_DEVTOOLS_GLOBAL_HOOK__, contentScriptId);
}

window.addEventListener('message', welcome);
