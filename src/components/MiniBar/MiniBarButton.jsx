import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as styles from './styles';

const metaPrefix = '⌘';

export default class MiniBarButton extends Component {

  static propTypes = {
    onToggle: PropTypes.func.isRequired,
    active: PropTypes.bool.isRequired,
    id: PropTypes.oneOf(['buttonUpdates', 'buttonGraph', 'buttonConsoleLog', 'buttonLog', 'buttonClear']).isRequired,
    style: PropTypes.object,
    hotkey: PropTypes.string,
  };

  static defaultProps = {
    style: undefined,
    hotkey: undefined,
  };

  state = {
    hovered: false,
  };

  handleMouseOver = () => this.setState({ hovered: true });
  handleMouseOut = () => this.setState({ hovered: false });

  render() {
    const { active, id, onToggle, style, hotkey } = this.props;
    const { hovered } = this.state;

    const additionalStyles = (() => {
      switch (id) {
        case 'buttonUpdates': return active ? styles.buttonUpdatesActive : styles.buttonUpdates;
        case 'buttonGraph': return active ? styles.buttonGraphActive : styles.buttonGraph;
        case 'buttonLog': return active ? styles.buttonLogActive : styles.buttonLog;
        case 'buttonConsoleLog': return active ? styles.buttonConsoleLogActive : styles.buttonConsoleLog;
        case 'buttonClear': return styles.buttonClear;
        default: return undefined;
      }
    })();

    const hotkeyFormatted = hotkey ? ` (${metaPrefix}${hotkey})` : '';

    const title = (() => {
      switch (id) {
        case 'buttonUpdates': return 'Visualize component re-renders';
        case 'buttonGraph': return 'Select a component and show its dependency tree';
        case 'buttonLog': return 'Log state changes in panel';
        case 'buttonConsoleLog': return 'Log state changes to the browser console';
        case 'buttonClear': return 'Clear log';
        default: return undefined;
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
        data-id={id}
        data-active={active}
        onClick={onToggle}
        title={title + hotkeyFormatted}
        style={finalSyles}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
      />
    );
  }
}
