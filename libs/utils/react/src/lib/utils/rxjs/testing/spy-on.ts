import { Observable } from 'rxjs';
import { ObserverSpy, CompletionCallback } from './observer-spy';

/**
 * Define Tuple reponse from spyOn() calls
 */
export type SpyOnTuple<T> = [ObserverSpy<T>, () => void, Observable<any>];

/**
 * !! Internal registry of active spy instances
 */
let subscriptions: SpyOnTuple<any>[] = [];

/**
 * Internal util function to remove a spy from the global watch list
 */
function removeSpyFromWatchList(target: ObserverSpy<any>) {
  // Rebuild watch list WITHOUT the target spy instance
  subscriptions = subscriptions.reduce((buffer: SpyOnTuple<any>[], item: SpyOnTuple<any>) => {
    const [spy] = item;
    if (target !== spy) {
      buffer.push(item);
    }
    return buffer;
  }, []);
}

// ********************************************************
// Public API
// ********************************************************

export interface SpyOnResponse<T> {
  spy: ObserverSpy<T>;
  source$: Observable<T>;
  dispose: () => void;
}

export const SpyUtils = {
  /**
   * Freeze all spys and dispose of any subscriptions
   * Used with tests `afterEach(() => disposeAllSpys())`
   */
  disposeAll() {
    [...subscriptions].map(([spy, dispose]) => {
      spy.freeze(true);
      dispose();
    });

    subscriptions = [];
  },

  /**
   * Allows external world to check for existing subscriptions
   */
  hasSpys(): boolean {
    return subscriptions.length > 0;
  },
};

/**
 * spyOn() target stream (with autoSubscribe) and optional
 * `complete` callback.
 * NOTE: this is a wrapper function for useSpyOn hook and returns
 * an object instead of a tuple.
 *
 * @return 'SpyOnResponse'
 */
export function spyOn<T>(stream$: Observable<T>, completionCallback?: CompletionCallback): SpyOnResponse<T> {
  const [spy, dispose, source$] = useSpyOn<T>(stream$, completionCallback);
  return { spy, dispose, source$ };
}

/**
 * useSpyOn(): Simplify use of ObserverSpy by black-box'ing the
 * ObserverSpy construction and disposal details.
 *
 * @param source Observable<T>
 * @param completionCallback [optional] Callback function invoked when the source stream completes
 * @return Tuple [<spyInstance>, dispose fn, source$ stream]
 */
export function useSpyOn<T>(source$: Observable<T>, completionCallback?: CompletionCallback): SpyOnTuple<T> {
  const spy = new ObserverSpy<T>(completionCallback);
  const subscription = source$.subscribe(spy);
  const dispose = () => {
    subscription.unsubscribe();
    removeSpyFromWatchList(spy);
  };
  subscriptions.push([spy, dispose, source$]);

  return [spy, dispose, source$];
}
