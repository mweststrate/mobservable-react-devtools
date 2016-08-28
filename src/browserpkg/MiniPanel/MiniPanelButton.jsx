import React, { Component, PropTypes } from 'react';
import * as styles from './styles';

export default class MiniPanelButton extends Component {

  static props = {
    onToggle: PropTypes.bool.isRequired,
    active: PropTypes.bool.isRequired,
    name: PropTypes.oneOf(['buttonUpdates', 'buttonGraph', 'buttonLog']).isRequired,
  };

  state = {
    hovered: false,
  };

  handleMouseOver = () => this.setState({ hovered: true });
  handleMouseOut = () => this.setState({ hovered: false });

  render() {
    const { active, id, onToggle } = this.props;
    const { hovered } = this.state;

    const additionalStyles = (() => {
      switch (id) {
        case 'buttonUpdates': return active ? styles.buttonUpdatesActive : styles.buttonUpdates;
        case 'buttonGraph': return active ? styles.buttonGraphActive : styles.buttonGraph;
        case 'buttonLog': return active ? styles.buttonLogActive : styles.buttonLog;
      }
    })();

    const title = (() => {
      switch (id) {
        case 'buttonUpdates': return 'Visualize component re-renders';
        case 'buttonGraph': return 'Select a component and show it\'s dependency tree';
        case 'buttonLog': return 'Log all MobX state changes and reactions to the browser console (use F12 to show / hide the console). Use Chrome / Chromium for an optimal experience';
      }
    })();

    const finalSyles = Object.assign(
      {},
      styles.button,
      additionalStyles,
      active && styles.button.active,
      hovered && styles.button.hover
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
