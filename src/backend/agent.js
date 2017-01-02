import deduplicateDependencies from './deduplicateDependencies';
import BrowserAgentDelegate from './BrowserAgentDelegate';
import Store from '../Store';
import ChangesProcessor from './ChangesProcessor';

const LS_UPDATES_KEY = 'mobx-react-devtool__updatesEnabled';
const LS_CONSOLE_LOG_KEY = 'mobx-react-devtool__clogEnabled';
const LS_PANEL_LOG_KEY = 'mobx-react-devtool__pLogEnabled';

export default class Agent {

  _disposables = [];

  _delegate;

  _bridges = [];

  logFilter = undefined;

  constructor(hook) {
    this._hook = hook;
    this._changesProcessor = new ChangesProcessor((change) => {
      if (this.logFilter) {
        try {
          const accept = this.logFilter(change);
          if (!accept) return;
        } catch (e) {
          console.warn('Error while evaluating logFilter:', e);
        }
      }
      if (this.store.state.logEnabled) {
        this.store.appendLog(change);
      }
      if (this.store.state.consoleLogEnabled) {
        this._delegate.consoleLogChange(change)
      }
    });

    const store = new Store('Hook store');
    this.store = store;

    if (typeof window !== 'undefined' && window.localStorage) {
      const updatesEnabled = window.localStorage.getItem(LS_UPDATES_KEY) === 'YES';
      if (updatesEnabled) this.store.toggleShowingUpdates(updatesEnabled);
      const panelLogEnabled = window.localStorage.getItem(LS_PANEL_LOG_KEY) === 'YES';
      if (panelLogEnabled) this.store.toggleLogging(panelLogEnabled);
      const consoleLogEnabled = window.localStorage.getItem(LS_CONSOLE_LOG_KEY) === 'YES';
      if (consoleLogEnabled) this.store.toggleConsoleLogging(consoleLogEnabled);
    }

     // BrowserDelegate can be replaced by NativeDelegate
    this._delegate = new BrowserAgentDelegate(this, hook);

    this._disposables.push(() => this._delegate.dispose());

    this._disposables.push(
      hook.sub('mobx', ({ mobxid, mobx }) => {
        this._setupMobx(mobx, mobxid)
      })
    );

    this._disposables.push(
      hook.sub('mobx-react', ({ mobxrid, mobxReact }) => {
        this._setupMobxReact(mobxReact, mobxrid)
      })
    );

    Object.keys(hook.instances).forEach(mobxid => {
      const mobx = hook.instances[mobxid].mobx;
      const mobxReact = hook.instances[mobxid].mobxReact;
      this._setupMobx(mobx, mobxid);
      if (mobxReact) this._setupMobxReact(mobxReact, mobxid);
    });
  }

  connect(bridge) {
    this._bridges.push(bridge);

    const connectionDisposables = [];

    connectionDisposables.push(
      Store.connectToBridge(this.store, bridge)
    );


    connectionDisposables.push(
      bridge.sub('request-store-sync', () => {
        this.store.sendSync();
      })
    );

    connectionDisposables.push(
      bridge.sub('request-agent-status', () => {
        this.sendStatus();
      })
    );

    connectionDisposables.push(
      this.store.subscribeActions((action) => {
        if (action === 'stop-picking-deptree-component') {
          this._delegate.clearHoveredDeptreeNode();
        }
        if (action === 'stop-logging' && !this.store.state.consoleLogEnabled
          || action === 'stop-console-logging' && !this.store.state.logEnabled
        ) {
          this._changesProcessor.flush();
        }

        if (typeof window !== 'undefined' && window.localStorage) {
          if (this.store.state.updatesEnabled) {
            window.localStorage.setItem(LS_UPDATES_KEY, 'YES');
          } else {
            window.localStorage.removeItem(LS_UPDATES_KEY);
          }
          if (this.store.state.logEnabled) {
            window.localStorage.setItem(LS_PANEL_LOG_KEY, 'YES');
          } else {
            window.localStorage.removeItem(LS_PANEL_LOG_KEY);
          }
          if (this.store.state.consoleLogEnabled) {
            window.localStorage.setItem(LS_CONSOLE_LOG_KEY, 'YES');
          } else {
            window.localStorage.removeItem(LS_CONSOLE_LOG_KEY);
          }
        }
      })
    );

    bridge.once('disconnect', () => {
      connectionDisposables.forEach(d => d());
      var ix = this._bridges.indexOf(bridge);
      if (ix !== -1) this._bridges.splice(ix, 1);
    });

    this.sendStatus();
    this.store.sendSync();
  }

  sendStatus() {
    const status = {
      mobxFound: Object.keys(this._hook.instances).length > 0,
      mobxReactFound: Object.keys(this._hook.instances).find(mobxrid => this._hook.instances[mobxrid].mobxReact) !== undefined,
    };
    this._bridges.forEach(bridge => bridge.send('agent-status', status));
  }

  _setupMobx(mobx, mobxid) {
    this._disposables.push(
      mobx.spy(change => {
        if (this.store.state.logEnabled || this.store.state.consoleLogEnabled) {
          this._changesProcessor.push(change, mobx);
        }
      })
    );
    this.sendStatus();
  }

  _setupMobxReact(mobxReact, mobxrid) {
    this._disposables.push(
      mobxReact.renderReporter.on(report => {
        if (this.store.state.updatesEnabled) {
          this._delegate.displayRenderingReport(report)
        }
      })
    );
    this.sendStatus();
  }

  onceShutdown(fn) {
    this._disposables.push(fn);
  };

  /* Deptree */

  pickedDeptreeComponnet(component, mobxid) {
    const dependencyTree = this._hook.instances[mobxid].mobx.extras.getDependencyTree(component.render.$mobx);
    deduplicateDependencies(dependencyTree);
    this.store.setDeptree(dependencyTree);
  }
}

