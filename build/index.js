"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateStream = void 0;
const assert = require("assert");
const events_1 = require("events");
const event_buffer_1 = require("./event-buffer");
class StateStream extends events_1.EventEmitter {
    constructor(currentPromise, ee, event, before) {
        super();
        this.currentPromise = currentPromise;
        this.before = before;
        this.readyState = 0 /* ReadyState.BUFFERING */;
        this.eventBuffer = new event_buffer_1.EventBuffer(ee, event);
        this.errorBuffer = new event_buffer_1.EventBuffer(ee, 'error');
        this.open();
    }
    async open() {
        let current;
        try {
            current = await this.currentPromise;
        }
        catch (error) {
            this.emit('error', error);
            return;
        }
        this.eventBuffer.flush();
        this.errorBuffer.flush();
        this.readyState = 1 /* ReadyState.FLUSHING */;
        for (const delta of current)
            this.emit('delta', delta);
        let started = false;
        this.eventBuffer.on('event', delta => {
            if (started || (started = this.before(current, delta)))
                this.emit('delta', delta);
        });
        this.errorBuffer.on('event', error => void this.emit('error', error));
    }
    close() {
        assert(this.readyState !== 0 /* ReadyState.BUFFERING */);
        this.readyState = 2 /* ReadyState.DETACHED */;
        this.eventBuffer.close();
        this.errorBuffer.close();
    }
}
exports.StateStream = StateStream;
//# sourceMappingURL=index.js.map