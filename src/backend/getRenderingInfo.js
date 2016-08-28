const getCost = renderTime => {
  switch(true) {
    case renderTime < 25: return 'cheap';
    case renderTime < 100: return 'acceptable';
    default: return 'expensive'
  }
};

const _boxesRegistry = typeof WeakMap !== 'undefined' ? new WeakMap() : new Map();

const hightlightTimeout = 2000;

const getBoxForNode = (node) => {
  if (_boxesRegistry.has(node)) return _boxesRegistry.get(node);
  const box  = {
    id: Math.random().toString(32).substr(2),
  };
  _boxesRegistry.set(node, box);
  return box;
};

export function getRenderingInfoForNode(report) {
      if (!report.node || isNaN(report.renderTime)) return;
      const offset = report.node.getBoundingClientRect();
      const box = getBoxForNode(report.node);
      box.type = 'rendering';
      box.y = offset.top;
      box.x = offset.left;
      box.width = offset.width;
      box.height = offset.height;
      box.renderInfo = {
        count: box.renderInfo && ++box.renderInfo.count || 1,
        renderTime: report.renderTime,
        totalTime: report.totalTime,
        cost: getCost(report.renderTime),
      };
      box.lifeTime = hightlightTimeout;
      if (box._timeout) clearTimeout(box._timeout);
      box._timeout = setTimeout(() => this.removeBox(report.node, true), hightlightTimeout);
  return box;
}

export function forgetRenderingInfoForNode(node) {
  this._boxesRegistry.delete(report.node);
}
