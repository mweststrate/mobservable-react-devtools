/* eslint-disable max-len */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class LogItem extends Component {

  static propTypes = {
    change: PropTypes.object.isRequired,
  };

  state = {
    open: false,
  };

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.open !== nextState.open;
  }

  handleClick = () => {
    this.setState({ open: !this.state.open }, () => {
      if (this.containerEl && this.containerEl.scrollIntoViewIfNeeded) {
        this.containerEl.scrollIntoViewIfNeeded();
      }
    });
  };

  renderBody() {
    const { change } = this.props;

    switch (change.type) {
      case 'action':
        // name, target, arguments, fn
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>Action</b> ‘{change.name}’ ({change.targetName})
          </span>
        );
      case 'transaction':
        // name, target
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>Transaction</b> ‘{change.name}’ ({change.targetName})
          </span>
        );
      case 'scheduled-reaction':
        // object
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>Scheduled async reaction</b> ‘{change.objectName}’
          </span>
        );
      case 'reaction':
        // object, fn
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>Reaction</b> ‘${change.objectName}’
          </span>
        );
      case 'compute':
        // object, target, fn
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>Computed</b> ‘{change.objectName}’ ({change.targetName})
          </span>
        );
      case 'error':
        // message
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>Error:</b> {change.message}
          </span>
        );
      case 'update':
        // (array) object, index, newValue, oldValue
        // (map, obbject) object, name, newValue, oldValue
        // (value) object, newValue, oldValue
        if (change.index) {
          return (
            <span className="mobxdevtool__LogItem__title">
              <b>Updated</b>
              ‘{change.objectName}[{change.index}]’:
              {String(change.newValue)} (was {String(change.oldValue)})
            </span>
          );
        }
        if (change.name) {
          return (
            <span className="mobxdevtool__LogItem__title">
              <b>Updated</b> ‘{change.objectName}.{change.name}’: {String(change.newValue)} (was {String(change.oldValue)})
            </span>
          );
        }
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>Updated</b> ‘{change.objectName}’: {String(change.newValue)} (was {String(change.oldValue)})
          </span>
        );
      case 'splice':
        // (array) object, index, added, removed, addedCount, removedCount
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>Spliced</b> ‘{change.objectName}’: index {change.index}, added {change.addedCount}, removed {change.removedCount}
          </span>
        );
      case 'add':
        // (map, object) object, name, newValue
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>Set</b> ‘{change.objectName}.{change.name}’: {String(change.newValue)}
          </span>
        );
      case 'delete':
        // (map) object, name, oldValue
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>Removed</b> ‘{change.objectName}.{change.name}’: {String(change.oldValue)}
          </span>
        );
      case 'create':
        // (value) object, newValue
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>Set</b> ‘{change.objectName}’: {String(change.newValue)}
          </span>
        );
      default:
        // generic fallback for future events
        return (
          <span className="mobxdevtool__LogItem__title">
            <b>{change.type}</b>
          </span>
        );
    }
  }

  render() {
    const { change } = this.props;
    return (
      <div className="mobxdevtool__LogItem" ref={(el) => { this.containerEl = el; }}>
        <div
          className={[
            'mobxdevtool__LogItem__body ',
            `mobxdevtool__LogItem__body--type-${change.type} `,
            (change.children.length ? 'mobxdevtool__LogItem__body--has-children ' : ''),
            (this.state.open ? 'mobxdevtool__LogItem__body--open ' : 'mobxdevtool__LogItem__body--closed '),
          ].join(' ')}
          onClick={this.handleClick}
        >
          {this.renderBody()}
        </div>
        {this.state.open &&
          change.children.map(child => <LogItem change={child} key={Math.random()} />)
        }
      </div>
    );
  }
}
