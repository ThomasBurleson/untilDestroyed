import { Subject, Observable } from 'rxjs';
import { filter, map, startWith, tap, takeUntil } from 'rxjs/operators';

export enum CollectionEvent {
  ITEM_ADDED = 'itemAdded',
  ITEM_UPDATED = 'itemUpdated',
  ITEM_REMOVED = 'itemRemoved',
  ITEM_ERROR = 'eventError',
}

export interface EmitEvent<K extends unknown> {
  type: string;
  data?: K;
}

export type EventRegistratons = Record<string, (data: any) => void>;

export class ItemEvent<K> implements EmitEvent<K> {
  constructor(public type: string, public data: K) {}
}

export const itemUpdated = (item: any) => new ItemEvent(CollectionEvent.ITEM_UPDATED, item);
export const itemRemoved = (itemId: string) => new ItemEvent(CollectionEvent.ITEM_REMOVED, itemId);
export const itemError = (error: any) => new ItemEvent(CollectionEvent.ITEM_ERROR, error);

const DestroyEvent = '[EventBus] destory';
export const destroyEventBus = () => ({ type: DestroyEvent });

type Unsubscribe = () => void;

/**
 * Simply Pub/Sub mechanism that support decoupled communication between services
 * Note: This EventBus does cache the most recent event for EACH type...
 */
export class EventBus {
  private cache: Record<string, EmitEvent<unknown>>;
  private destroy$: Observable<EmitEvent<unknown>>;
  private emitter: Subject<EmitEvent<unknown>>;

  constructor() {
    this.cache = {};
    this.emitter = new Subject<EmitEvent<unknown>>();

    this.listenForDestroy();
    this.captureEvents();
  }

  /**
   * Public API to stop all current subscriptions
   * and reset with clean EventBus
   */
  reset() {
    this.emit(destroyEventBus());
  }

  /**
   * Emit an event to all listeners on this messaging queu
   */
  emit(event: EmitEvent<any>) {
    this.emitter.next(event);
  }

  /**
   * Easily listen to a collection of events
   * And provide single teardown to disconnect all
   * internal connections.
   */
  onMany(collection: EventRegistratons): Unsubscribe {
    const eventKeys = Object.keys(collection);
    const connections = eventKeys.map((key) => this.on(key, collection[key]));

    return () => {
      connections.map((teardown) => teardown());
    };
  }

  /**
   * Listen on a single event, extract data
   * Publish a teardown function to disconnect later
   */
  on<T>(event: string, notify: (data: T) => void): Unsubscribe {
    const watch$ = this.emitter.pipe(
      startWith(this.cache[event]),
      takeUntil(this.destroy$),
      filter((e: EmitEvent<T>) => e?.type === event),
      map((e: EmitEvent<T>) => e.data)
    );
    const subscription = watch$.subscribe(notify);

    return subscription.unsubscribe.bind(subscription);
  }

  /**
   * Get an observable stream for a specific event
   */
  observableFor<T>(event: string): Observable<T> {
    const watch$ = this.emitter.pipe(
      takeUntil(this.destroy$),
      filter((e: EmitEvent<T>) => e.type === event),
      map((e: EmitEvent<T>) => e.data)
    );
    return watch$;
  }

  /**
   * Enable events to stop ALL subscriptions
   * Create special stream that ONLY emits destroy events
   */
  private listenForDestroy() {
    const clearCache = () => (this.cache = {});
    const onlyDestroyEvents = ({ type }: EmitEvent<unknown>) => type === DestroyEvent;
    this.destroy$ = this.emitter.pipe(filter(onlyDestroyEvents), tap(clearCache));
  }

  /**
   * Activate event interceptor to record last emission for each event type
   * NOTE: do not capture the 'destroy' event
   */
  private captureEvents() {
    const captureToCache = (e: EmitEvent<unknown>) => (this.cache[e.type] = e);
    this.emitter.pipe(takeUntil(this.destroy$), tap(captureToCache)).subscribe();
  }
}
