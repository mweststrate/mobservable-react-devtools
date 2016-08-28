import consoleLogChange from './consoleLogChange';

const renderingInfosRegistry = typeof WeakMap !== 'undefined' ? new WeakMap() : new Map();

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
    } else if (report.event === 'render' && report.node) {

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

      const offset = report.node.getBoundingClientRect();
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
      renderingInfo.hoverNode.style.position = 'fixed';
      renderingInfo.hoverNode.style.top = offset.top + 'px';
      renderingInfo.hoverNode.style.left = offset.left + 'px';
      renderingInfo.hoverNode.style.width = offset.width + 'px';
      renderingInfo.hoverNode.style.height = offset.height + 'px';
      renderingInfo.hoverNode.style.boxSizing = 'border-box';
      renderingInfo.hoverNode.style.zIndex = '64998';
      renderingInfo.hoverNode.style.minWidth = '60px';
      renderingInfo.hoverNode.style.outline = `3px solid  ${outlineColor}`;
      renderingInfo.hoverNode.style.pointerEvents = 'none';
      renderingInfo.hoverNode.style.transition = 'none';
      renderingInfo.hoverNode.style.opacity = 1;

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
      if (document.body.contains(renderingInfo.hoverNode) === false) {
        document.body.appendChild(renderingInfo.hoverNode);
      }
      renderingInfo.animationTimeout = setTimeout(() => {
        renderingInfo.hoverNode.style.transition = 'opacity 500ms ease-in';
        renderingInfo.hoverNode.style.opacity = 0;
      }, 1500);
      renderingInfo.removalTimeout = setTimeout(() => {
        document.body.removeChild(renderingInfo.hoverNode);
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
    if (node) {
      if (this._hoveredDeptreeNode) {
        this._hoveredDeptreeNode.style = null;
      }
      this._hoveredDeptreeNode = node;
      node.style.boxShadow = "inset 0 0 0 2px lightblue";
    }
  };

  _handleClick = e => {
    if (this._agent.store.state.graphEnabled !== true) return;

    const target = e.target;
    const { component, mobxid } = this._hook.findComponentByNode(target);
    if (component) {
      e.stopPropagation();
      e.preventDefault();
      if (this._hoveredDeptreeNode) {
        this._hoveredDeptreeNode.style = null;
        this._hoveredDeptreeNode = undefined;
      }
      this._agent.store.togglePickingDeptreeComponent(false);
      this._agent.pickedDeptreeComponnet(component, mobxid);
    }
  };
}
