import React from 'react';

import installGlobalHook from '../backend/installGlobalHook';
import Agent from '../backend/agent';
import Bridge from '../backend/Bridge';

import Loader from '../Loader';
import MiniPanel from '../components/MiniPanel';


installGlobalHook(window);

const hook = __MOBX_DEVTOOLS_GLOBAL_HOOK__;

hook.injectMobxReact(require('mobx-react'), require('mobx'));

const backendListeners = [];
const frontendListeners = [];
var backendWall = {
  listen(fn) {
    backendListeners.push(fn);
  },
  send(data) {
    setTimeout(() => frontendListeners.forEach(fn => fn(data)), 0);
  },
};

if (!hook.agent) {
  hook.agent = new Agent(hook);
}

hook.agent.connect(new Bridge(backendWall));

hook.agent.onceShutdown(() => {
  backendListeners.splice(0);
});

export const configureDevtool = ({ logEnabled, updatesEnabled, graphEnabled, logFilter }) => {
  if (logEnabled !== undefined) { hook.agent.store.toggleConsoleLogging(Boolean(logEnabled)); }
  if (updatesEnabled !== undefined) { hook.agent.store.toggleShowingUpdates(Boolean(updatesEnabled)); }
  if (graphEnabled !== undefined) { hook.agent.store.togglePickingDeptreeComponent(Boolean(graphEnabled)); }
  if (typeof logFilter === 'function') { hook.agent.logFilter = logFilter; }
};

const loaderConfig = {
  debugName: 'browserpkg UI',
  reload: () => {},
  reloadSubscribe: () => {},
  inject: done => {
    const wall = {
      listen(fn) {
        frontendListeners.push(fn);
      },
      send(data) {
        setTimeout(() => backendListeners.forEach(fn => fn(data)), 0);
      },
    };

    done(wall, () => {
      frontendListeners.splice(0);
    });
  }
};

export default () => <Loader quiet {...loaderConfig}><MiniPanel /></Loader>

