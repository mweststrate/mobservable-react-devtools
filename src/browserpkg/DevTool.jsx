import React, { Component } from 'react';
import PropTypes from 'prop-types';

import installGlobalHook from '../backend/installGlobalHook';
import Agent from '../backend/Agent_';
import ContextProvider from '../ContextProvider';
import MiniBar from '../components/MiniBar';
import Graph from '../components/Graph';

installGlobalHook(window);

// eslint-disable-next-line no-underscore-dangle
const hook = window.__MOBX_DEVTOOLS_GLOBAL_HOOK__;

hook.injectMobxReact(require('mobx-react'), require('mobx'));

if (!hook.agent) {
  hook.agent = new Agent(hook);
}

export const configureDevtool = ({
  logEnabled,
  updatesEnabled,
  graphEnabled,
  logFilter,
  highlightTimeout,
}) => {
  if (logEnabled !== undefined) {
    hook.agent.store.toggleConsoleLogging(Boolean(logEnabled));
  }
  if (updatesEnabled !== undefined) {
    hook.agent.store.toggleShowingUpdates(Boolean(updatesEnabled));
  }
  if (graphEnabled !== undefined) {
    hook.agent.store.togglePickingDeptreeComponent(Boolean(graphEnabled));
  }
  if (logFilter !== undefined) {
    hook.agent.store.setLogFilter(logFilter);
  }
  if (typeof highlightTimeout === 'number') {
    hook.agent.setHighlightTimeout(highlightTimeout);
  }
};

export default class DevTool extends Component {

  static propTypes = {
    noPanel: PropTypes.bool,
    logFilter: PropTypes.func,
    highlightTimeout: PropTypes.number,
    position: PropTypes.object,
  };

  static defaultProps = {
    noPanel: false,
    logFilter: undefined,
    highlightTimeout: undefined,
    position: undefined,
  };

  componentWillMount() {
    const { logFilter, highlightTimeout } = this.props;
    configureDevtool({ logFilter, highlightTimeout });
  }

  render() {
    const { noPanel, position } = this.props;
    return (
      <ContextProvider store={hook.agent.store}>
        <div>
          {!noPanel &&
            <MiniBar position={position} />
          }
          <Graph />
        </div>
      </ContextProvider>
    );
  }
}

