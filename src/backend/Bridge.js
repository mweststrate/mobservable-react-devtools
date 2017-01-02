/* Thanks, facebook */

const now = (typeof performance === 'object' && performance.now)
  ? () => performance.now()
  : () => Date.now();

const cancelIdleCallback = window.cancelIdleCallback || clearTimeout;
const requestIdleCallback = window.requestIdleCallback || function(cb, options) {
    // Magic numbers determined by tweaking in Firefox.
    // There is no special meaning to them.
    var delayMS = 3000 * lastRunTimeMS;
    if (delayMS > 500) {
      delayMS = 500;
    }

    return setTimeout(() => {
      var startTime = now();
      cb({
        didTimeout: false,
        timeRemaining() {
          return Infinity;
        },
      });
      var endTime = now();
      lastRunTimeMS = (endTime - startTime) / 1000;
    }, delayMS);
  };

export default class Bridge {

  _listeners = [];
  _buffer = [];

  constructor(wall) {
    this._wall = wall;
    wall.listen(this._handleMessage.bind(this));
  }

  send(evt, data = {}) {
    this._buffer.push({ evt, data });
    this.scheduleFlush();
  }

  pause() {
    this._wall.send({ type: 'pause' });
  }

  resume() {
    this._wall.send({ type: 'resume' });
  }

  sub(evt, fn) {
    if (this._listeners[evt] === undefined) {
      this._listeners[evt] = [];
    }
    this._listeners[evt].push(fn);
    return () => {
      var ix = this._listeners[evt].indexOf(fn);
      if (ix !== -1) {
        this._listeners[evt].splice(ix, 1);
      }
    };
  }

  scheduleFlush() {
    if (!this._flushHandle && this._buffer.length) {
      var timeout = this._paused ? 5000 : 500;
      this._flushHandle = requestIdleCallback(
        this.flushBufferWhileIdle.bind(this),
        {timeout}
      );
    }
  }

  cancelFlush() {
    if (this._flushHandle) {
      cancelIdleCallback(this._flushHandle);
      this._flushHandle = null;
    }
  }

  flushBufferWhileIdle(deadline) {
    this._flushHandle = null;

    // Magic numbers were determined by tweaking in a heavy UI and seeing
    // what performs reasonably well both when DevTools are hidden and visible.
    // The goal is that we try to catch up but avoid blocking the UI.
    // When paused, it's okay to lag more, but not forever because otherwise
    // when user activates React tab, it will freeze syncing.
    var chunkCount = this._paused ? 20 : 10;
    var chunkSize = Math.round(this._buffer.length / chunkCount);
    var minChunkSize = this._paused ? 50 : 100;

    while (this._buffer.length && (
      deadline.timeRemaining() > 0 ||
      deadline.didTimeout
    )) {
      var take = Math.min(this._buffer.length, Math.max(minChunkSize, chunkSize));
      var currentBuffer = this._buffer.splice(0, take);
      this.flushBufferSlice(currentBuffer);
    }

    if (this._buffer.length) {
      this.scheduleFlush();
    }
  }

  flushBufferSlice(bufferSlice) {
    var events = bufferSlice.map(({evt, data}) => ({type: 'event', evt, data: serialize(data)}));
    events._test = new SimpleMap();
    events._test.set(1, 2);
    this._wall.send({type: 'many-events', events});
  }

  once(evt, fn) {
    var self = this;
    function listener(e, data) {
      fn.call(this, e, data);
      var ix = self._listeners[evt].indexOf(listener);
      if (ix !== -1) {
        self._listeners[evt].splice(ix, 1);
      }
    }
    return this.sub(evt, listener)
  }

  _handleMessage(payload) {
    if (payload.type === 'resume') {
      this._paused = false;
      this.scheduleFlush();
      return;
    }

    if (payload.type === 'pause') {
      this._paused = true;
      this.cancelFlush();
      return;
    }

    if (payload.type === 'event') {
      var handlers = this._listeners[event.evt];
      const data = deserialize(payload.data);
      if (handlers) {
        handlers.forEach(fn => fn(data));
      }
    }

    if (payload.type === 'many-events') {
      payload.events.forEach(event => {
        const data = deserialize(event.data);
        var handlers = this._listeners[event.evt];
        if (handlers) {
          handlers.forEach(fn => fn(data));
        }
      });
    }
  }
}

class SimpleMap {
  keys = [];
  values = [];
  has(key) {
    return this.keys.includes(key);
  }
  get(key) {
    var index = this.keys.indexOf(key);
    if (index > -1) return this.values[index];
    return undefined;
  }
  set(key, value) {
    this.keys.push(key);
    this.values.push(value);
  }
}

const symbols = {
  type: '_type_B2QKDPEE7krkz)',
  name: '_name_cbVJ7B;NiDcgG6*',
  reference: '_reference_W74nQjZtTrW#Qe',
  proto: '_proto_RcA+AJfqvC9ef2',
};

function serialize(data, path = [], seen = new SimpleMap()) {

  if (!data || typeof data !== 'object') {
    if (typeof data === 'string' && data.length > 500) {
      return data.slice(0, 500) + '...';
    }
    if (typeof data === 'symbol') {
      return {
        [symbols.type]: 'symbol',
        [symbols.name]: data.toString(),
      };
    }
    if (typeof data === 'function') {
      return {
        [symbols.type]: 'function',
        [symbols.name]: data.name,
      };
    }
    return data;
  }

  if (data instanceof RegExp || data instanceof Date) {
    return data
  }

  var seenPath = seen.get(data);
  if (seenPath) {
    return {
      [symbols.reference]: seenPath,
    };
  }

  seen.set(data, path);

  if (data instanceof Array) {
    return data.map((o, i) => serialize(o, path.concat(i), seen));
  }

  var clone = {};

  if (data.__proto__ && data.__proto__ !== Object.prototype) {
    // This is complex object (dom node or mobx.something)
    // only short signature will be sent to prevent performance loss
    return {
      [symbols.type]: 'complexObject',
      [symbols.name]: data.constructor && data.constructor.name,
    }
  }

  for (var prop in data) if (data.hasOwnProperty(prop)) {
    clone[prop] = serialize(data[prop], path.concat(prop), seen);
  }

  return clone;
}

function deserialize(data, root) {
  root = root || data;
  if (!data || typeof data !== 'object') return data;
  if (data instanceof Array) {
    return data.map((o) => deserialize(o, root));
  }
  if (data[symbols.reference]) {
    return data[symbols.reference].reduce((acc, next) => acc[next], root);
  }
  for (var prop in data) if (data.hasOwnProperty(prop)) {
    data[prop] = deserialize(data[prop], root);
  }
  return data;
}
