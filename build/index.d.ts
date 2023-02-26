import { EventEmitter } from "events";
export declare class DeltaStream<Delta> extends EventEmitter {
    private currentPromise;
    private before;
    private eventBuffer;
    private errorBuffer;
    private readyState;
    constructor(currentPromise: Promise<Delta[]>, ee: EventEmitter, event: string, before: (state0: Delta[], delta: Delta) => boolean);
    private open;
    close(): void;
}
interface Events<Delta> {
    delta(delta: Delta): void;
    error(error: unknown): void;
}
export interface DeltaStream<Delta> extends EventEmitter {
    on<Event extends keyof Events<Delta>>(event: Event, listener: Events<Delta>[Event]): this;
    once<Event extends keyof Events<Delta>>(event: Event, listener: Events<Delta>[Event]): this;
    off<Event extends keyof Events<Delta>>(event: Event, listener: Events<Delta>[Event]): this;
    emit<Event extends keyof Events<Delta>>(event: Event, ...params: Parameters<Events<Delta>[Event]>): boolean;
}
export {};
