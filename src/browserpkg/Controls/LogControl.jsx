import React, { Component } from 'react';

export default class LogControl extends Component {

  static contextTypes = {
    store: React.PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { store } = __MOBX_DEVTOOLS_GLOBAL_HOOK__;
    this._unsubscribe = store.subscibeUpdates(() => this.setState({}));
  }

  componentWillUnmount() {
    this._unsubscribe()
  }

  render() {
    const { store } = __MOBX_DEVTOOLS_GLOBAL_HOOK__;
    const { children } = this.props;
    return React.cloneElement(children, {
      active: store.state.consoleLogEnabled,
      onToggle: () => store.toggleConsoleLogging(),
    });
  }
}
