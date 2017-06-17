/* eslint-disable no-console */

let advicedToUseChrome = false;

const formatChange = (change) => {
  switch (change.type) {
    case 'action':
      // name, target, arguments, fn
      return [
        '%caction \'%s\' (%s)',
        'color:dodgerblue',
        change.name,
        change.targetName,
      ];
    case 'transaction':
      // name, target
      return [
        '%ctransaction \'%s\' (%s)',
        'color:gray',
        change.name,
        change.targetName,
      ];
    case 'scheduled-reaction':
      // object
      return [
        '%cscheduled async reaction \'%s\'',
        'color:#10a210',
        change.objectName,
      ];
    case 'reaction':
      // object, fn
      return [
        '%creaction \'%s\'',
        'color:#10a210',
        change.objectName,
      ];
    case 'compute':
      // object, target, fn
      return [
        '%ccomputed \'%s\' (%s)',
        'color:#10a210',
        change.objectName,
        change.targetName,
      ];
    case 'error':
      // message
      return [
        '%cerror: %s',
        'color:tomato',
        change.message,
      ];
    case 'update':
      // (array) object, index, newValue, oldValue
      // (map, obbject) object, name, newValue, oldValue
      // (value) object, newValue, oldValue
      if (change.index) {
        return [
          "updated '%s[%s]': %s (was: %s)",
          change.objectName,
          change.index,
          change.newValue,
          change.oldValue,
        ];
      }
      if (change.name) {
        return [
          "updated '%s.%s': %s (was: %s)",
          change.objectName,
          change.name,
          change.newValue,
          change.oldValue,
        ];
      }
      return [
        "updated '%s': %s (was: %s)",
        change.objectName,
        change.newValue,
        change.oldValue,
      ];
    case 'splice':
      // (array) object, index, added, removed, addedCount, removedCount
      return [
        "spliced '%s': index %d, added %d, removed %d",
        change.objectName,
        change.index,
        change.addedCount,
        change.removedCount,
      ];
    case 'add':
      // (map, object) object, name, newValue
      return [
        "set '%s.%s': %s",
        change.objectName,
        change.name,
        change.newValue,
      ];
    case 'delete':
      // (map) object, name, oldValue
      return [
        "removed '%s.%s' (was %s)",
        change.objectName,
        change.name,
        change.oldValue,
      ];
    case 'create':
      // (value) object, newValue
      return [
        "set '%s': %s",
        change.objectName,
        change.newValue,
      ];
    default:
      // generic fallback for future events
      return [change.type, change];
  }
};

const getAdditionalMessages = (change) => {
  switch (change.type) {
    case 'action':
      return [
        { type: 'misc-log', data: change.arguments, children: [] },
        { type: 'misc-trace', children: [] },
      ];
    case 'reaction':
      return [
        { type: 'misc-trace', children: [] },
      ];
    case 'error':
      // message
      return [
        { type: 'misc-trace', children: [] },
      ];
    case 'update':
      return [
        {
          type: 'misc-dir',
          data: { newValue: change.newValue, oldValue: change.oldValue },
          children: [],
        },
        { type: 'misc-trace', children: [] },
      ];
    case 'splice':
      return [
        { type: 'misc-dir', data: { added: change.added, removed: change.removed }, children: [] },
        { type: 'misc-trace', children: [] },
      ];
    case 'add':
      return [
        { type: 'misc-dir', data: { newValue: change.newValue }, children: [] },
        { type: 'misc-trace', children: [] },
      ];
    case 'delete':
      return [
        { type: 'misc-dir', data: { oldValue: change.oldValue }, children: [] },
        { type: 'misc-trace', children: [] },
      ];
    case 'create':
      return [
        { type: 'misc-dir', data: { newValue: change.newValue }, children: [] },
        { type: 'misc-trace', children: [] },
      ];
    default:
      return [];
  }
};


const consoleX = (() => {
  const $consoleX = {
    log: () => {},
    groupCollapsed: () => {},
    groupEnd: () => {},
    warn: () => {},
    trace: () => {},
  };
  if (typeof console === 'undefined') return $consoleX;

  if (console.log) {
    $consoleX.log = (...args) => console.log(...args);
  }
  if (console.groupCollapsed) {
    $consoleX.groupCollapsed = (...args) => console.groupCollapsed(...args);
  }
  if (console.groupEnd) {
    $consoleX.groupEnd = (...args) => console.groupEnd(...args);
  }
  if (console.groupEnd) {
    $consoleX.groupEnd = (...args) => console.groupEnd(...args);
  }
  if (console.warn) {
    $consoleX.warn = (...args) => console.warn(...args);
  }
  // TODO: use stacktrace.js or similar and strip off unrelevant stuff?
  if (console.trace) {
    $consoleX.trace = (...args) => console.trace(...args);
  }
  return $consoleX;
})();

consoleX.dir = (...args) => console.dir(...args);

export default function consoleLogChange(change) {
  if (advicedToUseChrome === false && typeof window.navigator !== 'undefined' && window.navigator.userAgent.indexOf('Chrome') === -1) {
    consoleX.warn('The output of the MobX logger is optimized for Chrome');
    advicedToUseChrome = true;
  }

  const additionalMessages = getAdditionalMessages(change);
  const group = change.children.length + additionalMessages.length > 0;

  if (group) {
    consoleX.groupCollapsed(...formatChange(change));

    for (let i = 0; i < change.children.length; i += 1) {
      consoleLogChange(change.children[i]);
    }

    for (let i = 0; i < additionalMessages.length; i += 1) {
      const msg = additionalMessages[i];
      if (msg.type === 'misc-log') {
        consoleX.log(msg.data);
      } else if (msg.type === 'misc-dir') {
        consoleX.dir(msg.data);
      } else if (msg.type === 'misc-trace') {
        consoleX.trace();
      }
    }

    consoleX.groupEnd();
  } else if (change.type === 'error') {
    consoleX.error(...formatChange(change));
  } else {
    consoleX.log(...formatChange(change));
  }
}
