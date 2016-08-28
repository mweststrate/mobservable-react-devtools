import React, { Component, PropTypes } from 'react';
import * as styles from './styles';

export default class MiniPanelButton extends Component {

  static props = {
    onToggle: PropTypes.bool.isRequired,
    active: PropTypes.bool.isRequired,
    id: PropTypes.oneOf(['buttonUpdates', 'buttonGraph', 'buttonConsoleLog', 'buttonLog']).isRequired,
    style: PropTypes.object,
  };

  state = {
    hovered: false,
  };

  handleMouseOver = () => this.setState({ hovered: true });
  handleMouseOut = () => this.setState({ hovered: false });

  render() {
    const { active, id, onToggle, style } = this.props;
    const { hovered } = this.state;

    const additionalStyles = (() => {
      switch (id) {
        case 'buttonUpdates': return active ? styles.buttonUpdatesActive : styles.buttonUpdates;
        case 'buttonGraph': return active ? styles.buttonGraphActive : styles.buttonGraph;
        case 'buttonLog': return active ? styles.buttonLogActive : styles.buttonLog;
        case 'buttonConsoleLog': return active ? styles.buttonConsoleLogActive : styles.buttonConsoleLog;
        case 'buttonClear': return styles.buttonClear;
      }
    })();

    const title = (() => {
      switch (id) {
        case 'buttonUpdates': return 'Visualize component re-renders';
        case 'buttonGraph': return 'Select a component and show its dependency tree';
        case 'buttonLog': return 'Log state changes in panel';
        case 'buttonConsoleLog': return 'Log state changes to the browser console';
        case 'buttonClear': return 'Clear log';
      }
    })();

    const finalSyles = Object.assign(
      {},
      styles.button,
      additionalStyles,
      active && styles.button.active,
      hovered && styles.button.hover,
      style
    );

    return (
      <button
        type="button"
        onClick={onToggle}
        title={title}
        style={finalSyles}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
      />
    );
  }
};
