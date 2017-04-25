import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MiniBarButton from './MiniBarButton';
import * as styles from './styles';

export default class MiniBar extends Component {

  static propTypes = {
    position: PropTypes.shape({
      top: PropTypes.string,
      bottom: PropTypes.string,
      left: PropTypes.string,
      right: PropTypes.string,
    }),
  };

  static defaultProps = {
    position: {
      top: '0px',
      right: '20px',
    },
  };

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.$unsubscribe = this.context.store.subscibeUpdates(() => this.setState({}));
  }

  componentWillUnmount() {
    this.$unsubscribe();
  }

  handleToggleUpdates = () => this.context.store.toggleShowingUpdates();
  handleToggleGraph = () => this.context.store.togglePickingDeptreeComponent();
  handleToggleConsoleLogging = () => this.context.store.toggleConsoleLogging();

  render() {
    const { position } = this.props;
    const { store } = this.context;

    const additionalMiniPanelStyles = {};
    additionalMiniPanelStyles.top = position.top;
    additionalMiniPanelStyles.right = position.right;
    additionalMiniPanelStyles.bottom = position.bottom;
    additionalMiniPanelStyles.left = position.left;

    return (
      <div style={Object.assign({}, styles.panel, additionalMiniPanelStyles)}>
        <MiniBarButton
          id="buttonUpdates"
          onToggle={this.handleToggleUpdates}
          active={store.state.updatesEnabled}
        />
        <MiniBarButton
          id="buttonGraph"
          onToggle={this.handleToggleGraph}
          active={store.state.graphEnabled}
        />
        <MiniBarButton
          id="buttonConsoleLog"
          active={store.state.consoleLogEnabled}
          onToggle={this.handleToggleConsoleLogging}
        />
      </div>
    );
  }
}
