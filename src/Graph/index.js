import React, { Component } from 'react';
import ModalContainer from '../ModalContainer';
import { getGlobalState, setGlobalState, eventEmitter } from '../globalStore';
import * as styles from './styles.js';

export default class Graph extends Component {

  componentDidMount() {
    eventEmitter.on('update', this.handleUpdate);
  }

  componentWillUnmount() {
    eventEmitter.removeListener('update', this.handleUpdate)
  }

  handleUpdate = () => this.setState({});

  handleClose = () => setGlobalState({ dependencyTree: undefined });

  renderTreeItem({ name, dependencies }, isLast, isRoot) {
    return (
      <div style={styles.item} key={name}>
        <span style={Object.assign({}, styles.box, isRoot && styles.box.root)}>{name}</span>
        {dependencies &&
          <div style={styles.tree}>
            {dependencies.map((dependency, i) =>
              this.renderTreeItem(dependency, /*isLast:*/i == dependencies.length - 1))
            }
          </div>
        }
        {!isRoot && <span style={styles.itemHorisontalDash} />}
        {!isRoot && <span style={Object.assign({}, styles.itemVericalStick, isLast && styles.itemVericalStick.short)} />}
      </div>
    );
  }

  render() {
    const { dependencyTree } = getGlobalState();
    return (
      <ModalContainer onOverlayClick={this.handleClose}>
        {dependencyTree &&
          <div style={styles.graph}>
            <span style={styles.close} onClick={this.handleClose}>×</span>
            <div style={styles.tree}>
              {this.renderTreeItem(dependencyTree, /*isLast:*/true, /*isRoot:*/true)}
            </div>
          </div>
        }
      </ModalContainer>
    );
  }
};
