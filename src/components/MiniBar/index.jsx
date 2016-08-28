import React, { Component, PropTypes } from 'react';
import MiniBarButton from './MiniBarButton';
import * as styles from './styles';

export default class MiniPanel extends Component {

  static propTypes = {
  };

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
    const { position } = this.props;
    const { store } = this.context;

    const additionalMiniPanelStyles = {};
    if (position) {
      additionalMiniPanelStyles.top = position.top;
      additionalMiniPanelStyles.right = position.right;
      additionalMiniPanelStyles.bottom = position.bottom;
      additionalMiniPanelStyles.left = position.left;
    } else {
      additionalMiniPanelStyles.top = '0px';
      additionalMiniPanelStyles.right = '20px';
    }

    return (
      <div>
        <div style={Object.assign({}, styles.panel, additionalMiniPanelStyles)}>
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
            id="buttonConsoleLog"
            active={store.state.consoleLogEnabled}
            onToggle={() => store.toggleConsoleLogging()}
          />
        </div>
      </div>
    );
  }
};
