import deduplicateDependencies from './deduplicateDependencies';
import BrowserAgentDelegate from './BrowserAgentDelegate';
import Store from '../Store';
import ChangesProcessor from './ChangesProcessor';

const LS$UPDATES$KEY = 'mobx-react-devtool$$updatesEnabled';
const LS$CONSOLE$LOG$KEY = 'mobx-react-devtool$$clogEnabled';
const LS$PANEL$LOG$KEY = 'mobx-react-devtool$$pLogEnabled';


export default class Agent {

  $disposables = [];

  $delegate;

  $bridges = [];

  constructor(hook) {
    this.$hook = hook;
    this.$changesProcessor = new ChangesProcessor((change) => {
      if (this.store.state.logFilter) {
        try {
          const accept = this.store.state.logFilter(change);
          if (!accept) return;
        } catch (e) {
          console.warn('Error while evaluating logFilter:', e); // eslint-disable-line no-console
        }
      }
      if (this.store.state.logEnabled) {
        this.store.appendLog(change);
      }
      if (this.store.state.consoleLogEnabled) {
        this.$delegate.consoleLogChange(change);
      }
    });

    const store = new Store('Hook store');
    this.store = store;

    if (typeof window !== 'undefined' && window.localStorage) {
      const updatesEnabled = window.localStorage.getItem(LS$UPDATES$KEY) === 'YES';
      if (updatesEnabled) this.store.toggleShowingUpdates(updatesEnabled);
      const panelLogEnabled = window.localStorage.getItem(LS$PANEL$LOG$KEY) === 'YES';
      if (panelLogEnabled) this.store.toggleLogging(panelLogEnabled);
      const consoleLogEnabled = window.localStorage.getItem(LS$CONSOLE$LOG$KEY) === 'YES';
      if (consoleLogEnabled) this.store.toggleConsoleLogging(consoleLogEnabled);
    }

     // BrowserDelegate can be replaced by NativeDelegate
    this.$delegate = new BrowserAgentDelegate(this, hook);

    this.$disposables.push(() => this.$delegate.dispose());

    this.$disposables.push(
      hook.sub('mobx', ({ mobxid, mobx }) => {
        this.$setupMobx(mobx, mobxid);
      })
    );

    this.$disposables.push(
      hook.sub('mobx-react', ({ mobxrid, mobxReact }) => {
        this.$setupMobxReact(mobxReact, mobxrid);
      })
    );

    Object.keys(hook.instances).forEach((mobxid) => {
      const mobx = hook.instances[mobxid].mobx;
      const mobxReact = hook.instances[mobxid].mobxReact;
      this.$setupMobx(mobx, mobxid);
      if (mobxReact) this.$setupMobxReact(mobxReact, mobxid);
    });
  }

  connect(bridge) {
    this.$bridges.push(bridge);

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
          this.$delegate.clearHoveredDeptreeNode();
        }
        if ((action === 'stop-logging' && !this.store.state.consoleLogEnabled)
          || (action === 'stop-console-logging' && !this.store.state.logEnabled)
        ) {
          this.$changesProcessor.flush();
        }

        if (typeof window !== 'undefined' && window.localStorage) {
          if (this.store.state.updatesEnabled) {
            window.localStorage.setItem(LS$UPDATES$KEY, 'YES');
          } else {
            window.localStorage.removeItem(LS$UPDATES$KEY);
          }
          if (this.store.state.logEnabled) {
            window.localStorage.setItem(LS$PANEL$LOG$KEY, 'YES');
          } else {
            window.localStorage.removeItem(LS$PANEL$LOG$KEY);
          }
          if (this.store.state.consoleLogEnabled) {
            window.localStorage.setItem(LS$CONSOLE$LOG$KEY, 'YES');
          } else {
            window.localStorage.removeItem(LS$CONSOLE$LOG$KEY);
          }
        }
      })
    );

    bridge.once('disconnect', () => {
      connectionDisposables.forEach(d => d());
      const ix = this.$bridges.indexOf(bridge);
      if (ix !== -1) this.$bridges.splice(ix, 1);
    });

    this.sendStatus();
    this.store.sendSync();
  }

  sendStatus() {
    const status = {
      mobxFound: Object.keys(this.$hook.instances).length > 0,
      mobxReactFound: Object.keys(this.$hook.instances)
        .find(mobxrid => this.$hook.instances[mobxrid].mobxReact) !== undefined,
    };
    this.$bridges.forEach(bridge => bridge.send('agent-status', status));
  }

  $setupMobx(mobx) {
    this.$disposables.push(
      mobx.spy((change) => {
        if (this.store.state.logEnabled || this.store.state.consoleLogEnabled) {
          this.$changesProcessor.push(change, mobx);
        }
      })
    );
    this.sendStatus();
  }

  $setupMobxReact(mobxReact) {
    this.$disposables.push(
      mobxReact.renderReporter.on((report) => {
        if (this.store.state.updatesEnabled) {
          this.$delegate.displayRenderingReport(report);
        }
      })
    );
    this.sendStatus();
  }

  onceShutdown(fn) {
    this.$disposables.push(fn);
  }

  /* Deptree */

  pickedDeptreeComponnet(component, mobxid) {
    const dependencyTree =
      this.$hook.instances[mobxid].mobx.extras
        .getDependencyTree(component.render.$mobx);
    deduplicateDependencies(dependencyTree);
    this.store.setDeptree(dependencyTree);
  }

  setHighlightTimeout(highlightTimeout) {
    this.$delegate.highlightTimeout = highlightTimeout;
  }
}

