import assert = require("assert");
import { EventEmitter } from "events";
import { EventBuffer } from "./event-buffer";


const enum ReadyState {
	BUFFERING,
	FLUSHING,
	DETACHED,
}


export class StateStream<Delta> extends EventEmitter {
	private eventBuffer: EventBuffer;
	private errorBuffer: EventBuffer;
	private readyState = ReadyState.BUFFERING;

	public constructor(
		private currentPromise: Promise<Delta[]>,
		ee: EventEmitter,
		event: string,
		private before: (state0: Delta[], delta: Delta) => boolean,
	) {
		super();
		this.eventBuffer = new EventBuffer(ee, event);
		this.errorBuffer = new EventBuffer(ee, 'error');
		this.open();
	}

	private async open() {
		let current: Delta[];
		try {
			current = await this.currentPromise;
		} catch (error) {
			this.emit('error', error);
			return;
		}
		this.eventBuffer.flush();
		this.errorBuffer.flush();
		this.readyState = ReadyState.FLUSHING;

		for (const delta of current)
			this.emit('delta', delta);
		let started = false;
		this.eventBuffer.on('event', delta => {
			if (started ||= this.before(current, delta))
				this.emit('delta', delta);
		});
		this.errorBuffer.on('event', error => void this.emit('error', error));
	}

	public close() {
		assert(this.readyState !== ReadyState.BUFFERING);
		this.readyState = ReadyState.DETACHED;
		this.eventBuffer.close();
		this.errorBuffer.close();
	}
}

interface Events<Delta> {
	delta(delta: Delta): void;
	error(error: unknown): void;
}

export interface StateStream<Delta> extends EventEmitter {
	on<Event extends keyof Events<Delta>>(event: Event, listener: Events<Delta>[Event]): this;
	once<Event extends keyof Events<Delta>>(event: Event, listener: Events<Delta>[Event]): this;
	off<Event extends keyof Events<Delta>>(event: Event, listener: Events<Delta>[Event]): this;
	emit<Event extends keyof Events<Delta>>(event: Event, ...params: Parameters<Events<Delta>[Event]>): boolean;
}
