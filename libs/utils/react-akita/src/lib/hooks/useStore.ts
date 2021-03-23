import { produce } from 'immer';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { useState, useEffect, useLayoutEffect } from 'react';
import { Query, Store, StoreConfigOptions, StoreConfig, UpdateStateCallback } from '@datorama/akita';

import { useObservable } from './useObservable';

import {
  Destroy,
  GetState,
  SetState,
  StoreAPI,
  ComputedProperty,
  AddComputedProperty,
  WatchProperty,
  State,
  StateCreator,
  StateCreatorOptions,
  StateSelector,
  StateListener,
  StateSliceListener,
  Unsubscribe,
  Subscribe,
  SetError,
  SetLoading,
  UseStore,
  StateSelectorList,
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
): UseStore<TState> {
  /**
   * Internal Akita Store + Query instances
   * Note: Immer immutability is auto-applied via the `producerFn` configuration
   */
  const name = options.storeName || `ReactAkitStore${Math.random()}`;
  const store = new StoreWithConfig<TState>({}, { producerFn: produce, name });
  const query = new Query<TState>(store);
  const computed: Record<string, () => void> = {};

  /**
   * setIsLoading() + setError()
   * Status API methods available on 'api'
   */
  const setIsLoading: SetLoading = (isLoading = true) => store.update((s) => ({ ...s, isLoading }));
  const setError: SetError = (error: Error | unknown) => {
    store.update((s) => ({ ...s, error }));
  };

  /**
   * setState() + getState()
   * Build API methods used that delegate to the store and query
   */
  const getState: GetState<TState> = store.getValue.bind(store);
  const setState: SetState<TState> = (partial, replace) => {
    const isCallback = partial instanceof Function;
    const updateWithValue: UpdateStateCallback<TState> = (s) => (replace ? s : { ...s, ...partial });
    store.update(!isCallback ? updateWithValue : (partial as UpdateStateCallback<TState>));
  };

  /**
   * subscribe()
   * The subscribe function allows components to bind to a state-portion without forcing re-render on changes
   */
  const subscribe: Subscribe<TState> = <StateSlice>(
    listener: StateListener<TState> | StateSliceListener<StateSlice>,
    selector?: StateSelector<TState, StateSlice>
  ): Unsubscribe => {
    const onNext = (s: TState & StateSlice) => listener(s);
    const watcher = query.select(selector || identity).subscribe(onNext);
    return () => watcher.unsubscribe();
  };

  /**
   * addComputedProperty()
   *
   * Inject the computed property into the target 'state':
   *
   * - Subscribe to state changes with the computed property selectors
   * - Use the computed property predicate function to map to a 'value' response
   * - update the targeted computed property with the 'value' response
   *
   * This method is used inside createStore() to configure watches during state
   * initialization.
   *
   * NOTE: since the store/query are not yet ready, we 'queue' these requests
   *       and later in `registerComputedProperties()` we finish the setup
   *       for all computed properties
   */
  const addComputedProperty: AddComputedProperty<TState> = <K extends any, U>(
    property: ComputedProperty<TState, K, U>,
    target?: TState
  ) => {
    const deferredSetup = () => {
      const makeQuery = (predicate) => query.select(predicate);
      const source$ = combineLatest(property.selectors.map(makeQuery)).pipe(map(property.predicate));

      source$.subscribe((computedValue: unknown) => {
        callAsync((value) => {
          setState((s) => ({ ...s, ...{ [property.name]: value } }));
        }, computedValue);
      });
    };

    computed[property.name] = deferredSetup;
    return target;
  };

  /**
   * Watch for changes in a specific property and then notify 'listener'
   * This method is used inside createStore() to configure watches during state
   * initialization.
   */
  const watchProperty: WatchProperty<TState> = <StateSlice>(
    property: string,
    listener: StateSliceListener<StateSlice>
  ) => {
    const deferredSetup = () => {
      const onNext = (s: TState & StateSlice) => callAsync(listener, s);
      const selector = (s: TState) => s[property];
      const watcher = query.select(selector).subscribe(onNext);
      return () => watcher.unsubscribe();
    };

    computed[property] = deferredSetup;
  };

  const registerComputedProperties = () => {
    Object.keys(computed).map((propertyName) => {
      const registerNow = computed[propertyName];
      delete computed[propertyName];

      registerNow();
    });
  };

  const destroy: Destroy = () => store.destroy();

  /**
   * Create the Store instance with desired API
   * Create the immutable state using the 'createState()' callback factory
   * Add status state and fix Akita 'storename' bug.
   */
  const storeAPI: StoreAPI<TState> = {
    get: getState,
    set: setState,
    addComputedProperty: addComputedProperty,
    watchProperty: watchProperty,
    observe: subscribe,
    destroy: destroy,
    setIsLoading,
    setError,
  };
  const state = produce({}, () => createState(storeAPI));

  reinitStore(store, name, {
    ...state,
    ...{ error: null, isLoading: false },
  });
  registerComputedProperties();

  /**
   * Internal utility methods for selectors
   *
   * toObservable(): Build an RxJS stream for the specified selector(s)
   * toStateSlice(): Gather current state values for the specified selector(s)
   */
  const toObservable = <StateSlice>(
    selector: StateSelector<TState, StateSlice> | StateSelectorList<TState, StateSlice> = identity
  ) => {
    const list = selector instanceof Array ? <StateSelectorList<TState, StateSlice>>selector : [selector];
    return list.length == 1 ? query.select(list[0]) : combineLatest(list.map((it) => query.select(it)));
  };
  const getSliceValueFor = <StateSlice>(
    selector: StateSelector<TState, StateSlice> | StateSelectorList<TState, StateSlice> = identity
  ): any | any[] => {
    const list = selector instanceof Array ? (selector as StateSelectorList<TState, StateSlice>) : null;
    const getCurrent = (it: StateSelector<TState, StateSlice>) => <any>it(getState());

    return list ? list.map(getCurrent) : getCurrent(selector as StateSelector<TState, StateSlice>);
  };

  /**
   * After the store has been created and initialized with api + state.
   *
   * Developer will use this custom react hook to 'select' state data. This selection
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
  const useStore: any = <StateSlice>(
    selector?: StateSelector<TState, StateSlice> | StateSelectorList<TState, StateSlice>
  ) => {
    const [initial] = useState<StateSlice>(() => getSliceValueFor(selector));
    const [slice, setSlice$] = useObservable<unknown>(null, initial);

    useIsoLayoutEffect(() => {
      setSlice$(toObservable(selector));

      return () => destroy();
    }, [selector]);

    return typeof slice == 'undefined' ? initial : slice;
  };

  return Object.assign(useStore, storeAPI); // Decorate hook function with API methods, public custom hook/store
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

/**
 * Invoke the callback at the end of the microTask
 */
function callAsync(callback: (value: any) => void, resolveWith: any) {
  Promise.resolve(resolveWith).then(callback);
}
