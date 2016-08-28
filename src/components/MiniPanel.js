import React, { Component, PropTypes } from 'react';
import MiniBar from './MiniBar';
import Graph from './Graph';

export default class DevTool extends Component {

  static propTypes = {
    highlightTimeout: PropTypes.number,
    position: PropTypes.object,
    noMiniPanel: PropTypes.bool,
    // logFilter: PropTypes.func,
  };

  static defaultProps = {
    noMiniPanel: false,
  };

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  handleToggleGraph = () => {
  };

  render() {
    const { noMiniPanel, highlightTimeout } = this.props;
    return (
      <div>
        {noMiniPanel !== true &&
          <MiniBar position={this.props.position} highlightTimeout={highlightTimeout} />
        }
        <Graph />
      </div>
    );
  }
}


