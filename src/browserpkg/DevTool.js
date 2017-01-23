import React from 'react';

import installGlobalHook from '../backend/installGlobalHook';
import Agent from '../backend/agent';
import ContextProvider from '../ContextProvider';
import MiniPanel from '../components/MiniPanel';

installGlobalHook(window);

const hook = __MOBX_DEVTOOLS_GLOBAL_HOOK__;

hook.injectMobxReact(require('mobx-react'), require('mobx'));

if (!hook.agent) {
  hook.agent = new Agent(hook);
}

export const configureDevtool = ({ logEnabled, updatesEnabled, graphEnabled, logFilter }) => {
  if (logEnabled !== undefined) { hook.agent.store.toggleConsoleLogging(Boolean(logEnabled)); }
  if (updatesEnabled !== undefined) { hook.agent.store.toggleShowingUpdates(Boolean(updatesEnabled)); }
  if (graphEnabled !== undefined) { hook.agent.store.togglePickingDeptreeComponent(Boolean(graphEnabled)); }
  if (typeof logFilter === 'function') { hook.agent.logFilter = logFilter; }
};

export default () => <ContextProvider store={hook.agent.store}><MiniPanel /></ContextProvider>;

