const EventEmitter = require('events');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.subscribers = new Map();
    this.eventLog = [];
  }
  subscribe(topic, wsClient) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(wsClient);
  }
  publish(event) {
    if (!event.topic || !event.type) {
      throw new Error('Ereignis muss Topic und Typ haben');
    }
    this.eventLog.push(event);
    this._notifySubscribers(event.topic, event);
  }
  _notifySubscribers(topic, event) {
    const subscribers = this.subscribers.get(topic);
    if (!subscribers) return;
    for (const client of subscribers) {
      if (client.readyState === 1) {
        try {
          client.send(JSON.stringify({
            kind: 'EREIGNIS',
            event,
          }));
        } catch (error) {
          console.error('EventBus Fehler beim Senden des Ereignisses:', error.message);
        }}}}
  getEventLog() {
    return this.eventLog;
  }}

module.exports = new EventBus();
