/* Thanks, facebook */

const now = (typeof window.performance === 'object' && window.performance.now)
  ? () => window.performance.now()
  : () => Date.now();

class SimpleMap {
  keys = [];
  values = [];
  has(key) {
    return this.keys.includes(key);
  }
  get(key) {
    const index = this.keys.indexOf(key);
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
      return `${data.slice(0, 500)}...`;
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
    return data;
  }

  const seenPath = seen.get(data);
  if (seenPath) {
    return {
      [symbols.reference]: seenPath,
    };
  }

  seen.set(data, path);

  if (data instanceof Array) {
    return data.map((o, i) => serialize(o, path.concat(i), seen));
  }

  const clone = {};

  const prototype = Object.getPrototypeOf(data);
  if (prototype && prototype !== Object.prototype) {
    // This is complex object (dom node or mobx.something)
    // only short signature will be sent to prevent performance loss
    return {
      [symbols.type]: 'complexObject',
      [symbols.name]: data.constructor && data.constructor.name,
    };
  }

  for (const prop in data) {
    if (Object.prototype.hasOwnProperty.call(data, prop)) {
      clone[prop] = serialize(data[prop], path.concat(prop), seen);
    }
  }

  return clone;
}

const deserialize = (data, root) => {
  if (!data || typeof data !== 'object') return data;
  if (data instanceof Array) {
    return data.map(o => deserialize(o, root || data));
  }
  if (data[symbols.reference]) {
    return data[symbols.reference].reduce((acc, next) => acc[next], root || data);
  }
  for (const prop in data) {
    if (Object.prototype.hasOwnProperty.call(data, prop)) {
      data[prop] = deserialize(data[prop], root || data);
    }
  }
  return data;
};

// Custom polyfill that runs the queue with a backoff.
// If you change it, make sure it behaves reasonably well in Firefox.
let lastRunTimeMS = 5;
const cancelIdleCallback = window.cancelIdleCallback || clearTimeout;
const requestIdleCallback = window.requestIdleCallback || function reqIdleCallback(cb) {
  // Magic numbers determined by tweaking in Firefox.
  // There is no special meaning to them.
  let delayMS = 3000 * lastRunTimeMS;
  if (delayMS > 500) {
    delayMS = 500;
  }

  return setTimeout(() => {
    const startTime = now();
    cb({
      didTimeout: false,
      timeRemaining() {
        return Infinity;
      },
    });
    const endTime = now();
    lastRunTimeMS = (endTime - startTime) / 1000;
  }, delayMS);
};

export default class Bridge {

  $listeners = [];
  $buffer = [];

  constructor(wall) {
    this.$wall = wall;
    wall.listen(this.$handleMessage.bind(this));
  }

  send(evt, data = {}) {
    this.$buffer.push({ evt, data });
    this.scheduleFlush();
  }

  pause() {
    this.$wall.send({ type: 'pause' });
  }

  resume() {
    this.$wall.send({ type: 'resume' });
  }

  sub(evt, fn) {
    if (this.$listeners[evt] === undefined) {
      this.$listeners[evt] = [];
    }
    this.$listeners[evt].push(fn);
    return () => {
      const ix = this.$listeners[evt].indexOf(fn);
      if (ix !== -1) {
        this.$listeners[evt].splice(ix, 1);
      }
    };
  }

  scheduleFlush() {
    if (!this.$flushHandle && this.$buffer.length) {
      const timeout = this.$paused ? 5000 : 500;
      this.$flushHandle = requestIdleCallback(
        this.flushBufferWhileIdle.bind(this),
        { timeout }
      );
    }
  }

  cancelFlush() {
    if (this.$flushHandle) {
      cancelIdleCallback(this.$flushHandle);
      this.$flushHandle = null;
    }
  }

  flushBufferWhileIdle(deadline) {
    this.$flushHandle = null;

    // Magic numbers were determined by tweaking in a heavy UI and seeing
    // what performs reasonably well both when DevTools are hidden and visible.
    // The goal is that we try to catch up but avoid blocking the UI.
    // When paused, it's okay to lag more, but not forever because otherwise
    // when user activates React tab, it will freeze syncing.
    const chunkCount = this.$paused ? 20 : 10;
    const chunkSize = Math.round(this.$buffer.length / chunkCount);
    const minChunkSize = this.$paused ? 50 : 100;

    while (this.$buffer.length && (
      deadline.timeRemaining() > 0 ||
      deadline.didTimeout
    )) {
      const take = Math.min(this.$buffer.length, Math.max(minChunkSize, chunkSize));
      const currentBuffer = this.$buffer.splice(0, take);
      this.flushBufferSlice(currentBuffer);
    }

    if (this.$buffer.length) {
      this.scheduleFlush();
    }
  }

  flushBufferSlice(bufferSlice) {
    const events = bufferSlice.map(({ evt, data }) => ({ type: 'event', evt, data: serialize(data) }));
    events.$test = new SimpleMap();
    events.$test.set(1, 2);
    this.$wall.send({ type: 'many-events', events });
  }

  once(evt, fn) {
    const self = this;
    function listener(e, data) {
      fn.call(this, e, data);
      const ix = self.$listeners[evt].indexOf(listener);
      if (ix !== -1) {
        self.$listeners[evt].splice(ix, 1);
      }
    }
    return this.sub(evt, listener);
  }

  $handleMessage(payload) {
    if (payload.type === 'resume') {
      this.$paused = false;
      this.scheduleFlush();
      return;
    }

    if (payload.type === 'pause') {
      this.$paused = true;
      this.cancelFlush();
      return;
    }

    if (payload.type === 'event') {
      const handlers = this.$listeners[payload.evt];
      const data = deserialize(payload.data);
      if (handlers) {
        handlers.forEach(fn => fn(data));
      }
    }

    if (payload.type === 'many-events') {
      payload.events.forEach((event) => {
        const handlers = this.$listeners[event.evt];
        const data = deserialize(event.data);
        if (handlers) {
          handlers.forEach(fn => fn(data));
        }
      });
    }
  }
}

