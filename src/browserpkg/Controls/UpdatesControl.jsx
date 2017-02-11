import React, { Component, PropTypes } from 'react';

export default class UpdatesControl extends Component {

  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  componentDidMount() {
    // eslint-disable-next-line no-underscore-dangle
    const { store } = window.__MOBX_DEVTOOLS_GLOBAL_HOOK__.agent;
    this.$unsubscribe = store.subscibeUpdates(() => this.setState({}));
  }

  componentWillUnmount() {
    this.$unsubscribe();
  }

  handleUpdate = () => this.setState({});

  render() {
    // eslint-disable-next-line no-underscore-dangle
    const { store } = window.__MOBX_DEVTOOLS_GLOBAL_HOOK__.agent;
    const { children } = this.props;
    return React.cloneElement(children, {
      onToggle: () => store.toggleShowingUpdates(),
      active: store.state.updatesEnabled,
    });
  }
}
