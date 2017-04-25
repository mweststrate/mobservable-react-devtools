import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Bridge from './backend/Bridge';
import Store from './Store';
import Blocked from './components/Blocked';
import ContextProvider from './ContextProvider';

export default class Loader extends Component {

  static propTypes = {
    quiet: PropTypes.bool,
    debugName: PropTypes.string,
    reload: PropTypes.func.isRequired,
    reloadSubscribe: PropTypes.func.isRequired,
    inject: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
  };

  static defaultProps = {
    quiet: false,
    debugName: '',
  };

  state = {
    loading: true,
    mobxFound: false,
  };

  componentWillMount() {
    if (this.props.reloadSubscribe) {
      this.$unsubscribeReload = this.props.reloadSubscribe(() => this.reload());
    }
    this.props.inject((wall, teardownWall) => {
      this.$teardownWall = teardownWall;
      const bridge = new Bridge(wall);
      const store = new Store(`${this.props.debugName} store`);

      this.$disposeConnection = Store.connectToBridge(store, bridge);

      bridge.send('request-agent-status');
      bridge.send('request-store-sync');

      this.$disposables.push(
        bridge.sub('agent-status', (agentStatus) => {
          this.setState({ mobxFound: agentStatus.mobxFound });
        })
      );

      if (!this.$unMounted) {
        this.setState({ loading: false, store });
      }
    });
  }

  componentWillUnmount() {
    this.$unMounted = true;
    this.teardown();
  }

  $unMounted = false;
  $disposables = [];

  reload() {
    this.teardown();
  }

  teardown() {
    if (!this.$unMounted) {
      this.setState({ loading: true, store: undefined }, this.props.reload);
    }
    if (this.$disposeConnection) {
      this.$disposeConnection();
      this.$disposeConnection = undefined;
    }
    if (this.$unsubscribeReload) {
      this.$unsubscribeReload();
      this.$unsubscribeReload = undefined;
    }
    if (this.$teardownWall) {
      this.$teardownWall();
      this.$teardownWall = undefined;
    }
  }

  render() {
    if (this.state.loading && !this.props.quiet) {
      return !this.props.quiet && <Blocked>Loading...</Blocked>;
    }
    if (this.state.mobxFound !== true) {
      return !this.props.quiet && <Blocked>Looking for mobx...</Blocked>;
    }
    return (
      <ContextProvider store={this.state.store}>
        {React.Children.only(this.props.children)}
      </ContextProvider>
    );
  }
}
