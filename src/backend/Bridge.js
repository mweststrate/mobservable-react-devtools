export default class Bridge {

  constructor(wall) {
    this._listeners = [];
    this._wall = wall;
    wall.listen(this._handleMessage.bind(this));
  }

  send(evt, data = {}) {
    data = serialize(data);
    this._wall.send({type: 'event', evt, data });
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
    const data = deserialize(payload.data);
    if (payload.type === 'event') {
      if (this._listeners[payload.evt]) {
        this._listeners[payload.evt].forEach(fn => fn(data));
      } else {
        console.warn('No listenerts for', payload.evt);
      }
    }
  }
}

function cleanUp(message) {
  if (typeof message === 'function') {
    return undefined;
  }
  if (message instanceof Array) {
    return message.map(cleanUp);
  }
  if (message && typeof message === 'object') {
    const finalMessage = {};
    Object.keys(message).forEach(key => {
      finalMessage[key] = cleanUp(message[key])
    });
    return finalMessage;
  }
  return message;
}

function serialize(message) {
  return JSON.stringify(cleanUp(message));
}

function deserialize(message) {
  if (message === undefined) return undefined;
  return JSON.parse(message);
}
