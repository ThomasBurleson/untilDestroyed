import { produce } from 'immer';
import { Query, Store, StoreConfigOptions, StoreConfig } from '@datorama/akita';
import { useObservable } from '@mindspace-io/react';
import { useEffect, useLayoutEffect } from 'react';

import {
  Destroy,
  GetState,
  SetState,
  State,
  Status,
  StateCreator,
  StateCreatorOptions,
  StateSelector,
  StateListener,
  StateSliceListener,
  Subscribe,
  StoreApi,
  UseStore,
} from './store.interfaces';

/**
 * Akita expects a store decorator to be used to assign a name. If a name is not available,
 * a `console.error()` is thrown and inter-store messaging is not setup properly.
 * @see reinitStore() for the 'hack' fix
 */
@StoreConfig({ name: 'mindspace-io' })
class StoreWithConfig<T> extends Store<T> {}

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const identity = (s) => s as any;
const NOOP = () => {};

/**
 * Create a store with specified state
 *
 * The store instances is actually a React hook with Store API added
 * All stores are decorated with Status state (isLoading, error, setIsLoading, and setError)
 * Return a UseStore hook that will return either all state or partial state based on passed selector.
 *
 */
export function createStore<TState extends State>(
  createState: StateCreator<TState>,
  options: StateCreatorOptions = {}
): UseStore<TState & Status> {
  // Create the internal Akita Store + Query instances
  // Note: Immer immutability is auto-applied via the `producerFn` configuration
  const name = options.storeName || `ReactAkitStore${Math.random()}`;
  const store = new StoreWithConfig<TState>({}, { producerFn: produce, name });
  const query = new Query<TState>(store);

  // Build API methods used that delegate to the store and query
  const getState: GetState<TState> = store.getValue.bind(store);
  const setState: SetState<TState> = (partial, replace) => {
    store.update((s) => {
      return replace ? s : { ...s, ...partial };
    });
  };

  const setIsLoading = (isLoading = true) => store.update((s) => ({ ...s, isLoading }));
  const setError = (error: Error | unknown) => store.update((s) => ({ ...s, error }));

  const destroy: Destroy = () => store.destroy();
  const subscribe: Subscribe<TState> = <StateSlice>(
    listener: StateListener<TState> | StateSliceListener<StateSlice>,
    selector: StateSelector<TState & Status, StateSlice> = identity
  ) => {
    const onNext = (s: TState & StateSlice & Status) => listener(s);
    const watcher = query.select(selector).subscribe(onNext);
    return () => watcher.unsubscribe();
  };

  const api: StoreApi<TState> = { destroy, subscribe, getState, setState, setIsLoading, setError };
  const state = produce({}, () => createState(setState, getState, api));

  // Build and assign actual state
  reinitStore(store, name, { ...state, ...{ error: null, isLoading: false } });

  /**
   * After the store has been created and initialized with state.
   * Developer will use a custom react hook to 'select' state data. This selection
   * will re-emit data anytime the selected state changes.
   *
   * Here we build the custom hook to observe state or state slice
   * Remit slice value when distinctly changed
   * This hook is implicitly connected to its associated store
   *
   * Warning!!
   *   1) Do not use same 'useStore' hook multiple times in the same component.
   *   2) To extract multiple slices, use a single selector to return a hashmap or tuple
   */
  const useStore: any = <StateSlice>(selector: StateSelector<TState & Status, StateSlice> = identity) => {
    const [slice, setSlice$] = useObservable<string>(null, '');

    useIsoLayoutEffect(() => {
      setSlice$(query.select(selector));

      return () => destroy();
    }, [selector]);

    return slice;
  };

  // Decorate hook function with API methods
  Object.assign(useStore, api);

  // Publish the custom hook (with extra store APIs)
  return useStore;
}

// *******************************************************
// Hacks
// *******************************************************

/**
 * Currently Akita expects a store class to be decorated with @StoreConfi() to set a store name
 * If this is not done, the constructor will assert a `console.error()`
 * @param store
 * @param name
 */
function reinitStore(store: Store, name: string, state) {
  if (!!name && store.storeName != name) {
    store.constructor['akitaConfig'].storeName = name;
    (store['options'] as StoreConfigOptions & {
      storeName: string;
    }).storeName = name;
  }
  // Reinitalize
  store['onInit'](state);
}
