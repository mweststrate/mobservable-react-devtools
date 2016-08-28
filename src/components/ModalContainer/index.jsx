import React, { Component, PropTypes } from 'react';
import * as styles from './styles';

export default class ModalContaner extends Component {

  static propTypes = {
    children: PropTypes.node,
    onOverlayClick: PropTypes.func.isRequired,
  };

  componentDidUpdate(prevProps) {
    const html = document.body.parentNode;
    if (prevProps.children && !this.props.children) {
      // Disapeared
      this.rightOffset = 0;
      html.style.borderRight = null;
      html.style.overflow = null;
    } else if (!prevProps.children && this.props.children) {
      // Appeared
      const prevTotalWidth = html.offsetWidth;
      html.style.overflow = 'hidden';
      const nextTotalWidth = html.offsetWidth;
      const rightOffset = Math.max(0, nextTotalWidth - prevTotalWidth);
      html.style.borderRight = `${rightOffset}px solid transparent`
    }
  }

  stopPropogation = e => e.stopPropagation();

  render() {
    const { children, onOverlayClick } = this.props;
    if (!children) return null;
    return (
      <div
        style={styles.overlay}
        onClick={onOverlayClick}
      >
        <div
          key="content"
          style={styles.modal}
          onClick={this.stopPropogation}
        >
          {children}
        </div>
      </div>
    );
  }
};
