import consoleLogChange from './consoleLogChange';

const renderingInfosRegistry = typeof WeakMap !== 'undefined' ? new WeakMap() : new Map();

const hoverDeptreeNode = document.createElement('div');


const showNodeAroundNode = (node, targetNode, outlineColor) => {
  if (!targetNode || !targetNode.offsetParent || !node) return;

  const offset = {
    top: targetNode.offsetTop,
    left: targetNode.offsetLeft,
    width: targetNode.offsetWidth,
    height: targetNode.offsetHeight,
  };

  node.style.position = 'absolute';
  node.style.top = offset.top + 'px';
  node.style.left = offset.left + 'px';
  node.style.width = offset.width + 'px';
  node.style.height = offset.height + 'px';
  node.style.boxSizing = 'border-box';
  node.style.zIndex = '64998';
  node.style.pointerEvents = 'none';
  node.style.transition = 'none';
  node.style.opacity = 1;
  node.style.zIndex = '64998';
  node.style.outline = `2px solid  ${outlineColor}`;

  if (!targetNode.offsetParent.contains(node)) {
    targetNode.offsetParent.appendChild(node);
  }
};

const destroyNode = (node, transitionDeleay = 0) => {
  if (!node || !node.parentNode) return;
  if (transitionDeleay) {
    node.style.transition = `opacity ${transitionDeleay}ms ease-in`;
    node.style.opacity = 0;
    return setTimeout(() => {
      node.parentNode.removeChild(node);
    }, 1500);
  }
  node.parentNode.removeChild(node);
  return undefined;
};

export default class {

  _hoveredDeptreeNode = undefined;

  constructor(agent, hook) {
    this._agent = agent;
    this._hook = hook;

    document.body.addEventListener('mousemove', this._handleMouseMove, true);
    document.body.addEventListener('click', this._handleClick, true);
  }

  dispose() {
    document.body.removeEventListener('mousemove', this._handleMouseMove, true);
    document.body.removeEventListener('click', this._handleClick, true);
  }

  consoleLogChange(change, mobx, filter) {
    consoleLogChange(change, mobx, filter);
  }

  displayRenderingReport = report => {
    if (report.event === 'destroy') {
      if (report.node && renderingInfosRegistry.has(report.node)) {
        const renderingInfo = renderingInfosRegistry.get(report.node);
        if (document.body.contains(renderingInfo.hoverNode)) {
          document.body.removeChild(renderingInfo.hoverNode);
        }
        renderingInfosRegistry.delete(report.node);
      }
    } else if (report.event === 'render' && report.node && report.node.parentNode) {
      let renderingInfo = renderingInfosRegistry.get(report.node);
      if (renderingInfo) {
        clearTimeout(renderingInfo.animationTimeout);
        clearTimeout(renderingInfo.removalTimeout);
      } else {
        renderingInfo = {
          count: 1,
          hoverNode: document.createElement('div'),
          textNode: document.createElement('span'),
        };
        renderingInfo.hoverNode.appendChild(renderingInfo.textNode);
      }

      let outlineColor;
      let backgroundColor;

      if (report.renderTime < 25) {
        outlineColor = 'rgba(182, 218, 146, 0.75)';
        backgroundColor = 'rgba(182, 218, 146, 0.75)';
      } else if (report.renderTime < 100) {
        outlineColor = 'rgba(228, 195, 66, 0.85)';
        backgroundColor = 'rgba(228, 195, 66, 0.85)';
      } else {
        outlineColor = 'rgba(228, 171, 171, 0.95)';
        backgroundColor = 'rgba(228, 171, 171, 0.95)';
      }
      renderingInfo.textNode.style.fontFamily = 'verdana; sans-serif';
      renderingInfo.textNode.style.padding = '0 4px 2px';
      renderingInfo.textNode.style.color = 'rgba(0; 0; 0; 0.6)';
      renderingInfo.textNode.style.fontSize = '10px';
      renderingInfo.textNode.style.lineHeight = '12px';
      renderingInfo.textNode.style.pointerEvents = 'none';
      renderingInfo.textNode.style.float = 'right';
      renderingInfo.textNode.style.borderBottomRightRadius = '2px';
      renderingInfo.textNode.style.maxWidth = '100%';
      renderingInfo.textNode.style.maxHeight = '100%';
      renderingInfo.textNode.style.overflow = 'hidden';
      renderingInfo.textNode.style.whiteSpace = 'nowrap';
      renderingInfo.textNode.style.textOverflow = 'ellipsis';
      renderingInfo.textNode.style.backgroundColor = backgroundColor;
      renderingInfo.textNode.style.position = 'absolute';
      renderingInfo.textNode.style.top = '0px';
      renderingInfo.textNode.style.right = '0px';
      renderingInfo.textNode.innerHTML = `${renderingInfo.count} | ${report.renderTime} / ${report.totalTime} ms`;

      showNodeAroundNode(renderingInfo.hoverNode, report.node, outlineColor);

      renderingInfo.removalTimeout = setTimeout(() => {
        renderingInfo.animationTimeout = destroyNode(renderingInfo.hoverNode, 500);
      }, 2000);

      renderingInfo.count++;
      renderingInfosRegistry.set(report.node, renderingInfo);
    }
  };

  clearHoveredDeptreeNode() {
    this._hoveredDeptreeNode = undefined;
  }

  _handleMouseMove = e => {
    if (this._agent.store.state.graphEnabled !== true) return;

    const target = e.target;
    const node = this._hook.findComponentByNode(target).node;
    destroyNode(hoverDeptreeNode);
    if (node) {
      showNodeAroundNode(hoverDeptreeNode, node, 'lightBlue');
    }
  };

  _handleClick = e => {
    if (this._agent.store.state.graphEnabled !== true) return;

    const target = e.target;
    const { component, mobxid } = this._hook.findComponentByNode(target);
    if (component) {
      e.stopPropagation();
      e.preventDefault();
      destroyNode(hoverDeptreeNode, 500);
      this._agent.store.togglePickingDeptreeComponent(false);
      this._agent.pickedDeptreeComponnet(component, mobxid);
    }
  };
}
