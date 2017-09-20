import React, { Component } from 'react';
import { getGlobalState, setGlobalState, eventEmitter, restoreLogFromLocalstorage } from '../globalStore';

export default class LogControl extends Component {

  componentDidMount() {
    eventEmitter.on('update', this.handleUpdate);
    restoreLogFromLocalstorage();
  }

  componentWillUnmount() {
    eventEmitter.removeListener('update', this.handleUpdate)
  }

  handleUpdate = () => {
    this.setState({});
  };

  handleToggleLog = () => {
    const { logEnabled } = getGlobalState();
    setGlobalState({ logEnabled: !logEnabled })
  };

  render() {
    const { logEnabled } = getGlobalState();
    const { children } = this.props;
    return React.cloneElement(children, {
      onToggle: this.handleToggleLog,
      active: logEnabled,
    });
  }
}
