import React, { Component } from 'react';
import { trackComponents } from 'mobx-react';
import { getGlobalState, setGlobalState, eventEmitter, _handleMouseMove, _handleClick } from '../globalStore';

export default class GraphControl extends Component {

  componentWillMount() {
    this.setState({});
  }

  componentDidMount() {
    trackComponents();

    eventEmitter.on('update', this.handleUpdate);

    if (typeof window !== 'undefined') {
      if (typeof document !== 'undefined') {
        document.body.addEventListener('mousemove', _handleMouseMove, true);
        document.body.addEventListener('click', _handleClick, true);
      }
    }
  }

  componentWillUnmount() {
    eventEmitter.removeListener('update', this.handleUpdate)
    if (typeof document !== 'undefined') {
      document.body.removeEventListener('mousemove', _handleMouseMove, true);
      document.body.removeEventListener('click', _handleMouseMove, true);
    }
  }

  handleUpdate = () => this.setState({});

  handleToggleGraph = () => {
    const { graphEnabled } = getGlobalState();
    setGlobalState({
      hoverBoxes: [],
      graphEnabled: !graphEnabled,
    });
  };

  render() {
    const { graphEnabled } = getGlobalState();
    const { children } = this.props;
    return React.cloneElement(children, {
      onToggle: this.handleToggleGraph,
      active: graphEnabled,
    });
  }
}


