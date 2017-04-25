import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Blocked extends Component {

  static propTypes = {
    children: PropTypes.node,
    icon: PropTypes.string,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    icon: 'mobx',
    children: undefined,
    onClick: undefined,
  };

  renderIcon() {
    switch (this.props.icon) {
      case 'mobx':
        return (
          <svg baseProfile="basic" xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
            <path fill="none" stroke="#333232" strokeWidth="14" strokeMiterlimit="10" d="M8 15h14v98H8M120 15h-14v98h14" />
            <path fill="none" stroke="#EB3624" strokeWidth="18" strokeLinecap="square" strokeMiterlimit="10" d="M50 57l14 14 14-14" />
          </svg>
        );
      case 'pick':
        return (
          <svg baseProfile="basic" xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="-58.5 0 128 128">
            <path d="M-21.165 10.665L42.84 70.397l-30.943 2.67L29.5 112l-11.728 5.34L.7 77.864-21.165 98.66V10.664" />
          </svg>
        );
      default:
        return undefined;
    }
  }

  render() {
    return (
      <div
        onClick={this.props.onClick}
        style={{ position: 'fixed', zIndex: 1, top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', fontSize: '18px', background: 'rgba(255, 255, 255, 0.8)' }}
      >
        {this.renderIcon()}
        <div style={{ margin: '10px' }}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
