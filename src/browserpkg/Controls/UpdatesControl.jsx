import React, { Component, PropTypes } from 'react';

export default class UpdatesControl extends Component {

  static propTypes = {
    highlightTimeout: PropTypes.number,
  };

  static defaultProps = {
    highlightTimeout: 1500,
  };

  componentDidMount() {
    const { store } = __MOBX_DEVTOOLS_GLOBAL_HOOK__;
    this._unsubscribe = store.subscibeUpdates(() => this.setState({}));
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  handleUpdate = () => this.setState({});

  render() {
    const { store } = __MOBX_DEVTOOLS_GLOBAL_HOOK__;
    const { children } = this.props;
    return React.cloneElement(children, {
      onToggle: () => store.toggleShowingUpdates(),
      active: store.state.updatesEnabled,
    });
  }
}
