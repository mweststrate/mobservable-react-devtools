

export default class ChangesProcessor {

  constructor(onChange, filter) {
    this.onChange = onChange;
    this.filter = filter || (() => true);
  }

  path = [];

  push(change, mobx) {
    const isGroupStart = change.spyReportStart === true;
    const isGroupEnd = change.spyReportEnd === true;

    change.hidden = !this.filter(change);
    change.children = [];
    change.id = Math.random();

    if (isGroupEnd) {
      const superChange = this.path[this.path.length - 1];
      this.path.splice(this.path.length - 1);
      superChange.time = change.time;
      change.time = undefined;
      if (this.path.length === 0) {
        this.onChange(superChange);
        return;
      }
    } else {
      if (this.path.length > 0) {
        this.path[this.path.length - 1].children.push(change);
      }
      if (isGroupStart) {
        this.path.push(change);
      }
      switch (change.type) {
        case 'action':
          // name, target, arguments, fn
          change.targetName = getNameForThis(change.target);
          break;
        case 'transaction':
          // name, target
          change.targetName = getNameForThis(change.target);
          break;
        case 'scheduled-reaction':
          // object
          change.objectName = observableName(mobx, change.object);
          break;
        case 'reaction':
          // object, fn
          change.objectName = observableName(mobx, change.object);
          break;
        case 'compute':
          // object, target, fn
          change.objectName = observableName(mobx, change.object);
          change.targetName = getNameForThis(change.target);
          break;
        case 'error':
          // message
          if (this.path.length > 0) {
            this.onChange(this.path[0]);
            this.flush();
          } else {
            this.onChange(change);
          }
          return; // game over
        case 'update':
          // (array) object, index, newValue, oldValue
          // (map, obbject) object, name, newValue, oldValue
          // (value) object, newValue, oldValue
          change.objectName = observableName(mobx, change.object);
          change.newValue = formatValue(change.newValue);
          change.oldValue = formatValue(change.oldValue);
          break;
        case 'splice':
          change.objectName = observableName(mobx, change.object);
          // (array) object, index, added, removed, addedCount, removedCount
          break;
        case 'add':
          // (map, object) object, name, newValue
          change.objectName = observableName(mobx, change.object);
          change.newValue = formatValue(change.newValue);
          break;
        case 'delete':
          // (map) object, name, oldValue
          change.objectName = observableName(mobx, change.object);
          change.oldValue = formatValue(change.oldValue);
          break;
        case 'create':
          // (value) object, newValue
          change.objectName = observableName(mobx, change.object);
          change.newValue = formatValue(change.newValue);
          break;
        default:
          break;
      }

      if (this.path.length === 0) {
        this.onChange(change);
      }
    }
  }

  flush() {
    if (this.path.length > 0) {
      this.path = [];
    }
  }
}

function observableName(mobx, object) {
  return mobx.extras.getDebugName(object);
}

function formatValue(value) {
  if (isPrimitive(value)) {
    if (typeof value === "string" && value.length > 100)
      return value.substr(0, 97) + "...";
    return value;
  } else {
    return `(${getNameForThis(value)})`;
  }
}

function getNameForThis(who) {
  if (who === null || who === undefined) {
    return "";
  } else if (who && typeof who === "object") {
    if (who && who.$mobx) {
      return who.$mobx.name;
    } else if (who.constructor) {
      return who.constructor.name || "object";
    }
  }
  return `${typeof who}`;
}

function isPrimitive(value) {
  return value === null || value === undefined || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
