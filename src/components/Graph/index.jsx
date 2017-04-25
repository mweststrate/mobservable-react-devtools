import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ModalContainer from '../ModalContainer';
import * as styles from './styles';

export default class Graph extends Component {

  static contextTypes = {
    store: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.$unsubscribe = this.context.store.subscibeUpdates(() => this.setState({}));
  }

  componentWillUnmount() {
    this.$unsubscribe();
  }

  handleUpdate = () => this.setState({});

  handleClose = () => this.context.store.clearDeptree();

  renderTreeItem({ name, dependencies }, isLast, isRoot) {
    const stickStyle = Object.assign(
      {},
      styles.itemVericalStick,
      isLast && styles.itemVericalStick.short
    );

    return (
      <div style={styles.item} key={name}>
        <span style={Object.assign({}, styles.box, isRoot && styles.box.root)}>{name}</span>
        {dependencies &&
          <div style={styles.tree}>
            {dependencies.map((dependency, i) =>
              this.renderTreeItem(dependency, /* isLast:*/i === dependencies.length - 1))
            }
          </div>
        }
        {!isRoot && <span style={styles.itemHorisontalDash} />}
        {!isRoot && <span style={stickStyle} />}
      </div>
    );
  }

  render() {
    const { dependencyTree } = this.context.store.state;
    return (
      <ModalContainer onOverlayClick={this.handleClose}>
        {dependencyTree &&
          <div style={styles.graph}>
            <span style={styles.close} onClick={this.handleClose}>×</span>
            <div style={styles.rootThree}>
              {this.renderTreeItem(dependencyTree, /* isLast:*/true, /* isRoot:*/true)}
            </div>
          </div>
        }
      </ModalContainer>
    );
  }
}
