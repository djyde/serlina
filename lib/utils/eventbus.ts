export default class EventBus {

  handlers = {};

  on (eventName: string, fn) {
    this.handlers[eventName] = this.handlers[eventName] || []
    this.handlers[eventName].push(fn)
  }

  emit (eventName: string, payload?: any) {
    if (this.handlers[eventName]) {
      this.handlers[eventName].forEach(fn => {
        fn(payload)
      })
    }
  }
}