import React, { Component, PropTypes } from 'react';
import GraphControl from '../Controls/GraphControl';
import LogControl from '../Controls/LogControl';
import UpdatesControl from '../Controls/UpdatesControl';
import MiniPanelButton from './MiniPanelButton';
import * as styles from './styles';

export default class MiniPanel extends Component {

  static contextTypes = {
    store: React.PropTypes.object.isRequired,
  };
  
  static propTypes = {
    highlightTimeout: PropTypes.number,
  };

  componentDidMount() {
    this._unsubscribe = this.context.store.subscibeUpdates(() => this.setState({}));
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  render() {
    const { position, highlightTimeout } = this.props;

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
          <UpdatesControl highlightTimeout={highlightTimeout}>
            <PanelButton id={'buttonUpdates'} />
          </UpdatesControl>
          <GraphControl>
            <MiniPanelButton id ={'buttonGraph' } />
          </GraphControl>
          <LogControl>
            <MiniPanelButton id={'buttonLog'} />
          </LogControl>
        </div>
      </div>
    );
  }
};
