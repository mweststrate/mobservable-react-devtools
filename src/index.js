import React, { Component, PropTypes } from 'react';
import RenderingMonitor from './RenderingMonitor';
import mobservable from 'mobservable';
import mobservableReact from 'mobservable-react';
import deduplicateDependencies from './deduplicateDependencies';

import Panel from './Panel';
import Highlighter from './Highlighter';
import Graph from './Graph';

const LS_UPDATES_KEY = 'mobservable-react-devtool__updatesEnabled';
const LS_LOG_KEY = 'mobservable-react-devtool__logEnabled';

export default class DevTool extends Component {

  static propTypes = {
    hightlightTimeout: PropTypes.number,
  };

  static defaultProps = {
    hightlightTimeout: 1500,
  };

  state = {
    updatesEnabled: window.localStorage.getItem(LS_UPDATES_KEY) === 'YES',
    graphEnabled: false,
    logEnabled: window.localStorage.getItem(LS_LOG_KEY) === 'YES',
    hoverBoxes: [],
  };

  componentWillMount() {
    const { hightlightTimeout } = this.props;

    /* Start magic */
    mobservableReact.trackComponents();

    this.renderingMonitor = new RenderingMonitor({
      hightlightTimeout,
      shouldReport: () => this.state.updatesEnabled,
      onUpdate: () => this.forceUpdate(),
      getCoordinates: target => this.getCoordinates(target),
    });

    document.body.addEventListener('mousemove', this._handleMouseMove, true);
    document.body.addEventListener('click', this._handleClick, true);
  }

  componentWillUnmount() {
    this.renderingMonitor.dispose();
    document.body.removeEventListener('mousemove', this._handleMouseMove);
    document.body.removeEventListener('click', this._handleMouseMove);
  }

  getCoordinates(target) {
    const maxOffsetParent = (this.containerEl || {}).offsetParent;
    let node = target;
    let top = 0;
    let left = 0;
    while (node && node !== maxOffsetParent) {
      top += node.offsetTop || 0;
      left += node.offsetLeft || 0;
      node = node.offsetParent;
    }
    return { top, left };
  }

  _handleMouseMove = e => {
    if (this.state.graphEnabled) {
      const target = e.target;
      const node = this.findComponentAndNode(target).node;
      if (node) {
        const coordinates = this.getCoordinates(node);
        this.setState({
          hoverBoxes: [{
            id: 'the hovered node',
            type: 'hover',
            x: coordinates.left,
            y: coordinates.top,
            width: node.offsetWidth,
            height: node.offsetHeight,
          }]
        });
      }
    }
  };

  _handleClick = e => {
    if (this.state.graphEnabled) {
      const target = e.target;
      const component = this.findComponentAndNode(target).component;
      if (component) {
        e.stopPropagation();
        e.preventDefault();
        const dependencyTree = mobservable.extras.getDependencyTree(component.render);
        deduplicateDependencies(dependencyTree);
        this.setState({
          dependencyTree,
          hoverBoxes: [],
          graphEnabled: false,
        });
      }
    }
  };

  findComponentAndNode(target) {
    let node = target;
    let component;
    while(node) {
      component = mobservableReact.componentByNodeRegistery.get(node);
      if (component) return { component, node };
      node = node.parentNode;
    }
    return { component: undefined, node: undefined };
  }

  handleToggleUpdates = () => {
    const updatesEnabled = !this.state.updatesEnabled;
    this.setState({ updatesEnabled });
    if (updatesEnabled) {
      window.localStorage.setItem(LS_UPDATES_KEY, 'YES');
    } else {
      window.localStorage.removeItem(LS_UPDATES_KEY);
    }
  };

  handleToggleGraph = () => {
    this.setState({
      hoverBoxes: [],
      graphEnabled: !this.state.graphEnabled
    });
  };

  handleToggleLog = () => {
    if (this.logListenerDisposer) this.logListenerDisposer();
    this.logListenerDisposer = undefined;

    const logEnabled = !this.state.logEnabled;

    this.setState({ logEnabled });

    if (logEnabled) {
      this.logListenerDisposer = mobservable.extras.trackTransitions();
      window.localStorage.setItem(LS_LOG_KEY, 'YES');
    } else {
      window.localStorage.removeItem(LS_LOG_KEY);
    }
  };

  handleCloseGraph = () => {
    this.setState({ dependencyTree: undefined })
  };

  render() {
    const { updatesEnabled, graphEnabled, logEnabled, dependencyTree } = this.state;

    return (
      <div ref={el => this.containerEl = el}>
        <Panel
          updatesEnabled={updatesEnabled}
          graphEnabled={graphEnabled}
          logEnabled={logEnabled}
          onToggleUpdates={this.handleToggleUpdates}
          onToggleGraph={this.handleToggleGraph}
          onToggleLog={this.handleToggleLog}
        />
        <Highlighter
          boxes={this.renderingMonitor.boxesList.concat(this.state.hoverBoxes)}
        />
        <Graph
          dependencyTree={dependencyTree}
          onClose={this.handleCloseGraph}
        />
      </div>
    );
  }
}


