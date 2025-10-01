export class EventHandler<T> {
  private handlers: any;
  func: any;
  args: any;
  constructor() {
    this.handlers = {};
  }

  on = <K extends keyof T>(event: K, func: (args: T[K]) => void) => {
    this.handlers[event] = this.handlers[event] || [];

    this.handlers[event].push(func);

    return this;
  };

  off = <K extends keyof T>(event: K, func?: (args: T[K]) => void) => {
    const _handlers = this.handlers[event];

    if (_handlers) {
      if (func) {
        for (let i = 0; i < _handlers.length; i++) {
          if (_handlers[i] === func) {
            _handlers.splice(i, 1);
          }
        }
      } else {
        this.handlers[event] = [];
      }
    }

    return this;
  };

  clear = <K extends keyof T>(event: K) => {
    this.handlers[event] = [];
  };

  callEmitFromMT() {
    this.func.apply(null, this.args ? [this.args] : []);
  }

  emit = <K extends keyof T>(event: K, args?: T[K]) => {
    if (this.handlers[event]) {
      for (let i = 0; i < this.handlers[event].length; i++) {
        try {
          queueMicrotask(
            this.callEmitFromMT.bind({
              func: this.handlers[event][i],
              args: args,
            })
          );
        } catch (err) {
          console.log(err);
        }
      }
    }

    return this;
  };
}
