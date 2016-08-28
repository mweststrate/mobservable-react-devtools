var React = require('react');
import Log from './Log';
import Graph from './Graph';
import MiniBarButton from './MiniBar/MiniBarButton';
import Blocked from './Blocked';


export default class RichPanel extends React.Component {

  static contextTypes = {
    store: React.PropTypes.object.isRequired,
  };

  componentDidMount() {
    this._unsubscribe = this.context.store.subscibeUpdates(() => this.setState({}));
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  handleUpdate = () => this.setState({});

  render() {
    const { store } = this.context;

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        {store.state.graphEnabled &&
          <Blocked icon="pick" onClick={() => store.togglePickingDeptreeComponent()}>
            Pick the component
          </Blocked>
        }

        <div style={{ display: 'flex', flex: '0 0 26px', borderBottom: '1px solid #eee' }}>

          <MiniBarButton
            id="buttonUpdates"
            onToggle={() => store.toggleShowingUpdates()}
            active={store.state.updatesEnabled}
          />
          <MiniBarButton
            id="buttonGraph"
            onToggle={() => store.togglePickingDeptreeComponent()}
            active={store.state.graphEnabled}
          />
          <MiniBarButton
            id="buttonLog"
            active={store.state.logEnabled}
            onToggle={() => store.toggleLogging()}
          />
          <MiniBarButton
            id="buttonConsoleLog"
            active={store.state.consoleLogEnabled}
            onToggle={() => store.toggleConsoleLogging()}
          />

          {store.state.log.length > 0 &&
            <MiniBarButton
              style={{ marginLeft: 'auto' }}
              id="buttonClear"
              active={false}
              onToggle={() => store.clearLog()}
            />
          }

        </div>

        <Log />

        <Graph />

      </div>
    );
  }
}
