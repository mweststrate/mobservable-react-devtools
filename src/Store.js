export default class Store {

  static $version = '0.0.0';

  static connectToBridge(store, bridge) {
    const disposables = [
      store.subscribeActions((data) => {
        data.debugName = store.debugName;
        bridge.send('event', data);
      }),
      bridge.sub('event', (data) => {
        if (data.action) {
          store.handleAction(data);
        }
      }),
      bridge.sub('agent-status', (agentStatus) => {
        store.$setStateKey('mobxReactFound', agentStatus.mobxReactFound);
      }),
    ];

    return () => disposables.forEach(fn => fn());
  }

  static checkStoreVersionCompatible(store) {
    return Number(store.constructor.$version.split('.')[0]) === Number(Store.$version.split('.')[0]);
  }

  constructor(debugName) {
    this.debugName = debugName;
  }

  id = Math.random().toString(32).slice(2);

  state = {
    updatesEnabled: false,
    graphEnabled: false,
    logEnabled: false,
    consoleLogEnabled: false,
    logFilter: undefined,
    mobxReactFound: false,
    log: [],
    dependencyTree: undefined,
    lastUpdate: 0,
  };

  lastUpdates = {};

  actionsListeners = [];
  updatedListeners = [];
  disposables = [];

  handleAction(event) {
    if (event.action === 'set-key') {
      if (!(this.lastUpdates[event.key] >= event.timestamp)) {
        this.$setStateKey(event.key, event.value, event.timestamp);
      }
    } else if (event.action === 'append-log') {
      if (!(this.lastUpdates.log >= event.timestamp)) {
        this.appendLog(event.data, event.timestamp);
      }
    } else if (event.action === 'sync') {
      Object.keys(event.state).forEach((key) => {
        if (event.lastUpdates[key] && (this.lastUpdates[key] || 0) < event.lastUpdates[key]) {
          this.$setStateKey(key, event.state[key], event.lastUpdates[key]);
        }
      });
    }
  }

  sendSync() {
    this.actionsListeners.forEach(fn => fn({
      action: 'sync',
      state: this.state,
      lastUpdates: this.lastUpdates,
    }));
  }

  $setStateKey(key, value, timestamp = new Date().getTime()) {
    if (this.state[key] !== value) {
      this.state[key] = value;
      this.lastUpdates[key] = timestamp;
      this.actionsListeners.forEach(fn => fn({ action: 'set-key', key, value, timestamp }));
      this.scheduleUpdate();
    }
  }

  scheduleUpdate() {
    clearTimeout(this.updt);
    this.updt = setTimeout(this.$sendUpdated, 15);
  }

  $sendUpdated = () => {
    this.updatedListeners.forEach(fn => fn());
  };

  subscribeActions = (fn) => {
    this.actionsListeners.push(fn);
    return () => {
      if (this.actionsListeners.indexOf(fn) !== -1) {
        this.actionsListeners.splice(this.actionsListeners.indexOf(fn), 1);
      }
    };
  };

  subscibeUpdates = (fn) => {
    this.updatedListeners.push(fn);
    return () => {
      if (this.updatedListeners.indexOf(fn) !== -1) {
        this.updatedListeners.splice(this.updatedListeners.indexOf(fn), 1);
      }
    };
  };

  toggleShowingUpdates(on = !this.state.updatesEnabled) {
    this.$setStateKey('updatesEnabled', on);
  }

  togglePickingDeptreeComponent(on = !this.state.graphEnabled) {
    this.$setStateKey('graphEnabled', on);
  }

  toggleLogging(on = !this.state.logEnabled) {
    this.$setStateKey('logEnabled', on);
  }

  toggleConsoleLogging(on = !this.state.consoleLogEnabled) {
    this.$setStateKey('consoleLogEnabled', on);
  }

  appendLog(data, timestamp = new Date().getTime()) {
    let log = this.state.log;
    if (log.length > 500) {
      log = log.slice(-480);
    }
    this.state.log = log.concat(data);
    this.lastUpdates.log = timestamp;
    this.actionsListeners.forEach(fn => fn({ action: 'append-log', data, timestamp }));
    // Timeout to prevent React warning about setState during update
    this.scheduleUpdate();
  }

  clearLog() {
    this.$setStateKey('log', []);
  }

  setDeptree(deptree) {
    this.$setStateKey('dependencyTree', deptree);
  }

  clearDeptree() {
    this.$setStateKey('dependencyTree', undefined);
  }

  setLogFilter(logFilter) {
    this.$setStateKey('logFilter', logFilter);
  }

  disposeBridge = () => {
    this.disposables.forEach(fn => fn());
    this.disposables.splice(0);
  };
}

