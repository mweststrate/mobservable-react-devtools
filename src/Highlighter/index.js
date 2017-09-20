import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as styles from './styles';

export default class Highlighter extends Component {

  static propTypes = {
    boxes: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(['rendering', 'hover']).isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      renderInfo: PropTypes.shape({
        count: PropTypes.number.isRequired,
        renderTime: PropTypes.number.isRequired,
        totalTime: PropTypes.number.isRequired,
        cost: PropTypes.oneOf(['cheap', 'acceptable', 'expensive']).isRequired,
      }),
      lifeTime: PropTypes.number.isRequired
    })).isRequired,
  };

  renderBox(box) {
    switch (box.type) {
      case 'rendering':
        let renderingCostStyle = styles.rendering[box.renderInfo.cost] || {};
        return (
          <div
            key={box.id}
            // A poor man's animation:
            ref={el => setTimeout(() => { if (el) el.style.opacity = 0; }, box.lifeTime - 500)}
            style={Object.assign({}, styles.box, styles.rendering, renderingCostStyle, {
                left: box.x,
                top: box.y,
                width: box.width,
                height: box.height,
              })}
          >
            <span style={Object.assign({}, styles.text, renderingCostStyle.text)}>
              {box.renderInfo.count}x | {box.renderInfo.renderTime} / {box.renderInfo.totalTime} ms
            </span>
          </div>
        );

      case 'hover':
        return (
          <div
            key={box.id}
            style={Object.assign({}, styles.box, styles.hover, {
                left: box.x,
                top: box.y,
                width: box.width,
                height: box.height,
            })}
          />
        );

      default:
        throw new Error();
    }
  }

  render() {
    const { boxes } = this.props;

    return (
      <div>
        {boxes.map(box => this.renderBox(box))}
      </div>
    );
  }
};
