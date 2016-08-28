/**
 * NOTE: This file cannot `require` any other modules. We `.toString()` the
 *       function in some places and inject the source into the page.
 */

export default function installGlobalHook(window) {

  if (window.__MOBX_DEVTOOLS_GLOBAL_HOOK__) {
    return;
  }
  Object.defineProperty(window, '__MOBX_DEVTOOLS_GLOBAL_HOOK__', {
    value: ({
      instances: {},
      injectMobx: function(mobx) {
        mobx = mobx.default || mobx;
        var mobxid;
        for (var id in this.instances) {
          if (this.instances[id] && this.instances[id].mobx === mobx) {
            mobxid = id;
            break;
          }
        }
        if (!mobxid) {
          mobxid = Math.random().toString(32).slice(2);
          this.instances[mobxid] = { mobx };
          this.emit('mobx', { mobxid, mobx });
        }
      },
      injectMobxReact: function(mobxReact, mobx) {
        mobxReact = mobxReact.default || mobxReact;
        mobx = mobx.default || mobx;
        mobxReact.trackComponents();
        var mobxid;
        for (var id in this.instances) {
          if (this.instances[id] && this.instances[id].mobx === mobx
            && (this.instances[id].mobxReact === undefined || this.instances[id].mobxReact === mobxReact)
          ) {
            mobxid = id;
            break;
          }
        }
        if (!mobxid) {
          mobxid = Math.random().toString(32).slice(2);
          this.instances[mobxid] = { mobx, mobxReact };
          this.emit('mobx', { mobxid, mobx });
          this.emit('mobx-react', { mobxid, mobxReact });
        } else if (this.instances[mobxid].mobxReact !== mobxReact) {
          this.instances[mobxid].mobxReact = mobxReact;
          this.emit('mobx-react', { mobxid, mobxReact });
        }
      },

      findComponentByNode(target) {
        var node = target;
        var component;
        var mobxid;
        while(node) {
          for (var mid in this.instances) {
            var mobxReact = this.instances[mid].mobxReact;
            if (mobxReact) {
              var c = mobxReact.componentByNodeRegistery.get(node);
              if (c) return {
                node: node,
                component: c,
                mobxid: mid,
              };
            }
          }
          node = node.parentNode;
        }
        return {};
      },

      _listeners: {},
      sub: function(evt, fn) {
        this.on(evt, fn);
        return () => this.off(evt, fn);
      },
      on: function(evt, fn) {
        if (!this._listeners[evt]) {
          this._listeners[evt] = [];
        }
        this._listeners[evt].push(fn);
      },
      off: function(evt, fn) {
        if (!this._listeners[evt]) {
          return;
        }
        var ix = this._listeners[evt].indexOf(fn);
        if (ix !== -1) {
          this._listeners[evt].splice(ix, 1);
        }
        if (!this._listeners[evt].length) {
          this._listeners[evt] = null;
        }
      },
      emit: function(evt, data) {
        if (this._listeners[evt]) {
          this._listeners[evt].map(fn => fn(data));
        }
      },
    }),
  });
}
