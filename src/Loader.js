var React = require('react');
import Bridge from './backend/Bridge';
import Store from './Store';
import Blocked from './components/Blocked';

class ContextProvider extends React.Component {

  static childContextTypes = {
    store: React.PropTypes.object.isRequired,
  };

  getChildContext() {
    return { store: this.props.store };
  }

  render() {
    return this.props.children;
  }
}

export default class Loader extends React.Component {

  static propTypes = {
    quiet: React.PropTypes.bool,
    debugName: React.PropTypes.string,
    reload: React.PropTypes.func.isRequired,
    reloadSubscribe: React.PropTypes.func.isRequired,
    inject: React.PropTypes.func.isRequired,
  };

  _unMounted = false;
  _disposables = [];

  state = {
    loading: true,
    mobxFound: false,
  };

  componentWillMount() {
    if (this.props.reloadSubscribe) {
      this._unsubscribeReload = this.props.reloadSubscribe(() => this.reload())
    }
    this.props.inject((wall, teardownWall) => {
      this._teardownWall = teardownWall;
      const bridge = new Bridge(wall);
      const store = new Store(`${this.props.debugName} store`);

      this._disposeConnection = Store.connectToBridge(store, bridge);

      bridge.send('request-agent-status');
      bridge.send('request-store-sync');

      this._disposables.push(
        bridge.sub('agent-status', (agentStatus) => {
          this.setState({ mobxFound: agentStatus.mobxFound });
        })
      );

      if (!this._unMounted) {
        this.setState({ loading: false, store });
      }
    });
  }

  componentWillUnmount() {
    this._unMounted = true;
    this.teardown();
  }

  reload() {
    this.teardown();
  }

  teardown() {
    if (!this._unMounted) {
      this.setState({ loading: true, store: undefined }, this.props.reload);
    }
    if (this._disposeConnection) {
      this._disposeConnection();
      this._disposeConnection = undefined;
    }
    if (this._unsubscribeReload) {
      this._unsubscribeReload();
      this._unsubscribeReload = undefined;
    }
    if (this._teardownWall) {
      this._teardownWall();
      this._teardownWall = undefined;
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
