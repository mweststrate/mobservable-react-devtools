import React, { Component, PropTypes } from 'react';

export default class GraphControl extends Component {
  
  componentWillMount() {
    this.setState({});
  }

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
      onToggle: () => store.togglePickingDeptreeComponent(),
      active: store.state.graphEnabled,
    });
  }
}


