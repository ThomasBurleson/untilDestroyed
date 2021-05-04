import { EmitEvent } from './eventbus';

/**
 * These event utils are purposed to announce entity collection changes.
 *
 * This also demonstrates how to build EventBus messaging using the `createEvent()` pattern.
 * eg   `bus.emit( itemUpdated(item) )`
 */

export enum CollectionEvent {
  ITEM_ADDED = 'itemAdded',
  ITEM_UPDATED = 'itemUpdated',
  ITEM_REMOVED = 'itemRemoved',
  ITEM_ERROR = 'eventError',
}

export class ItemEvent<K> implements EmitEvent<K> {
  constructor(public type: string, public data: K) {}
}

export const itemUpdated = (item: any) => new ItemEvent(CollectionEvent.ITEM_UPDATED, item);
export const itemRemoved = (itemId: string) => new ItemEvent(CollectionEvent.ITEM_REMOVED, itemId);
export const itemError = (error: any) => new ItemEvent(CollectionEvent.ITEM_ERROR, error);
