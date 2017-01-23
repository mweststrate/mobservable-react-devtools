import React, { Component, PropTypes } from 'react';

export default class ContextProvider extends Component {

  static childContextTypes = {
    store: PropTypes.object.isRequired,
  };

  getChildContext() {
    return { store: this.props.store };
  }

  render() {
    return this.props.children;
  }
}