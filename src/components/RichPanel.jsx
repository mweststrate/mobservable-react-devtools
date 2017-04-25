import React from 'react';
import PropTypes from 'prop-types';
import Log from './Log';
import Graph from './Graph';
import MiniBarButton from './MiniBar/MiniBarButton';
import Blocked from './Blocked';


export default class RichPanel extends React.Component {

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.$unsubscribe = this.context.store.subscibeUpdates(() => this.setState({}));
  }

  componentWillUnmount() {
    this.$unsubscribe();
  }

  handleUpdate = () => this.setState({});

  handleToggleUpdates = () => this.context.store.toggleShowingUpdates();
  handleToggleGraph = () => this.context.store.togglePickingDeptreeComponent();
  handleToggleConsoleLogging = () => this.context.store.toggleConsoleLogging();
  handleToggleLogging = () => this.context.store.toggleLogging();
  handleClearLog = () => this.context.store.clearLog();

  render() {
    const { store } = this.context;

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        {store.state.graphEnabled &&
          <Blocked icon="pick" onClick={this.handleToggleGraph}>
            Pick the component
          </Blocked>
        }

        <div style={{ display: 'flex', flex: '0 0 26px', borderBottom: '1px solid #eee' }}>

          {store.state.mobxReactFound &&
            <MiniBarButton
              id="buttonUpdates"
              onToggle={this.handleToggleUpdates}
              active={store.state.updatesEnabled}
            />
          }
          {store.state.mobxReactFound &&
            <MiniBarButton
              id="buttonGraph"
              onToggle={this.handleToggleGraph}
              active={store.state.graphEnabled}
            />
          }
          <MiniBarButton
            id="buttonLog"
            active={store.state.logEnabled}
            onToggle={this.handleToggleLogging}
          />
          <MiniBarButton
            id="buttonConsoleLog"
            active={store.state.consoleLogEnabled}
            onToggle={this.handleToggleConsoleLogging}
          />

          {store.state.log.length > 0 &&
            <MiniBarButton
              style={{ marginLeft: 'auto' }}
              id="buttonClear"
              active={false}
              onToggle={this.handleClearLog}
            />
          }

        </div>

        <Log />

        <Graph />

      </div>
    );
  }
}
