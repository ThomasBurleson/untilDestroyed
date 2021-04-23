import { produce } from 'immer';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';

import { useState, useEffect, useLayoutEffect } from 'react';
import {
  Query,
  Store,
  StoreConfigOptions,
  UpdateStateCallback,
  applyTransaction as batchAction,
  combineQueries,
} from '@datorama/akita';

import { useObservable } from '../hooks/useObservable';

import {
  Destroy,
  GetState,
  SetState,
  StoreAPI,
  HookAPI,
  ComputedProperty,
  AddComputedProperty,
  ApplyTransaction,
  ApplyTransactionOptions,
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
  OnInitialized,
} from './reactive-store.interfaces';

import { isDev } from '../env';

// For server-side rendering: https://github.com/react-spring/zustand/pull/34
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const identity = (s: any) => s as any;
const NOOP = () => {};

/**
 * Create a store with specified state
 *
 * The store instances is actually a React hook with Store API added
 * All stores are decorated with Status state (isLoading, error, setIsLoading, and setError)
 *
 * @returns useStore: Hook that will emit either all state or partial state [based on passed selector].
 */
export function createStore<TState extends State>(
  createState: StateCreator<TState>,
  options: StateCreatorOptions = {}
): UseStore<TState> {
  /**
   * During store startup configuration, we may need to capture
   * initial state and notify store to allow side affects.
   *
   * NOTE: this initialization is for the STORE not for the hook usage...
   *       !!store.reset() does NOT affect the sideaffects from initialization
   */
  const initializer = {
    state: null, // used for both initialization AND reset()
    completed: false,
    registerOnInit: (notifyMe: OnInitialized) => {
      initializer.onInit = () => {
        const unsubscribe = notifyMe();
        initializer.onDestroy = !!unsubscribe && typeof unsubscribe === 'function' ? unsubscribe : NOOP;
        initializer.completed = true;
      };
    },
    onInit: NOOP, // call when initialization is done and ready to notify store
    onDestroy: NOOP, // call to store is destroyed and cleanup from onReady() activity
  };

  const computed: Record<string, (() => Unsubscribe) | (() => void)> = {};

  const name = options.storeName || `ReactAkitStore${Math.random()}`;
  const resettable = options.hasOwnProperty('autoReset') ? !!options.autoReset : false;
  const recompute = new BehaviorSubject<TState>({} as TState);

  /**
   * Internal Akita Store + Query instances
   * Note: Immer immutability is auto-applied via the `producerFn` configuration
   */
  const store = new Store<TState>({}, { producerFn: produce, name, resettable });
  const query = new Query<TState>(store);

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

  const applyTransaction: ApplyTransaction<TState> = (
    action: () => TState | void,
    options?: ApplyTransactionOptions
  ) => {
    const msg = (phase) => `---- ${phase} applyTransaction() ----- `;
    const log = (phase) => options?.enableLog && isDev() && console.log(msg(phase));

    log('start');
    const response = batchAction(action as () => TState, options?.thisArg);
    log('stop');

    return response;
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
   * NOTE: At this point, the store/query are not yet ready!! we 'queue' these requests
   *       and later in `registerComputedProperties()` we finish the setup
   *       for all computed properties
   */
  const addComputedProperty: AddComputedProperty<TState> = <K extends any, U>(
    store: TState,
    property: ComputedProperty<TState, K, U> | ComputedProperty<TState, K, U>[]
  ) => {
    const list = normalizeProperties(property);

    list.map((it) => {
      const deferredSetup = () => {
        validateComputedProperty(store, it);

        const makeQuery = (predicate) => query.select(predicate);
        const selectors = normalizeSelector(it.selectors);
        const emitters: Observable<any>[] = selectors.map(makeQuery);
        const source$ = emitters.length > 1 ? combineQueries([...emitters, recompute.asObservable()]) : emitters[0];
        const subscription = source$.pipe(map(it.transform), debounceTime(1)).subscribe((computedValue: unknown) => {
          setState((s) => ({ ...s, [it.name]: computedValue }));
        });

        if (!!it.initialValue) {
          const initialValue =
            typeof it.initialValue === 'function' ? (it.initialValue as Function)() : it.initialValue;
          setState((s) => ({ ...s, [it.name]: initialValue }));
        }

        return () => subscription.unsubscribe();
      };

      computed[it.name] = !initializer.completed ? deferredSetup : deferredSetup();
    });
    return store;
  };

  /**
   * Watch for changes in a specific property and then notify 'listener'
   * This method is used inside createStore() to configure watches during state
   * initialization.
   *
   * NOTE: Unlike observe() which does NOT trigger component rerenders, the 'listener'
   *       has access to `set`; which (if used) will trigger rerenders
   */
  const watchProperty: WatchProperty<TState> = <StateSlice>(
    store: TState,
    property: string,
    listener: StateSliceListener<StateSlice>
  ) => {
    const deferredSetup = () => {
      if (validateWatchedProperty(store, property)) {
        const selector = (s: TState) => s[property];
        const source$ = query.select(selector).pipe(debounceTime(1));
        const watcher = source$.subscribe(listener);

        return () => watcher.unsubscribe();
      }
    };

    computed[property] = !initializer.completed ? deferredSetup : deferredSetup();

    return store;
  };

  /**
   * Activate all 'queued' computed/watched properties
   */
  const registerComputedProperties = () => {
    Object.keys(computed).map((propertyName) => {
      const registerNow = computed[propertyName];
      computed[propertyName] = registerNow() as Unsubscribe;
    });
  };

  /**
   * Complete streams and close the store
   */
  const destroy: Destroy = () => {
    Object.keys(computed).map((propertyName) => {
      const unsubscribe = computed[propertyName] as Unsubscribe;
      unsubscribe();
    });
    store.destroy(); // release internal state and streams
    initializer.onDestroy(); // enable store cleanup of custom side affects
  };

  /**
   * Do not auto-destroy the store on hook/component dismount
   * stores can be shared and persistent between mountings.
   *
   * Reset() for two conditions:
   *
   * (1) Dismount - When component unmounts and the hook is released,
   *                ^ this requires options 'resettable' to be true
   * (2) Imperative - When shared state should be cleared/reset
   *                  ^ available anytime so the shared hook can reset state
   *
   * Reset store to initial state and force recompute of properties
   *
   */
  const reset = (forced = false) => {
    // we need our computed values to recompute.
    resettable && store.reset();
    recompute.next({ ...initializer.state });

    if (forced) {
      const nextState = produce({}, () => ({ ...initializer.state }));
      store._setState(nextState);
    }
  };

  /**
   * Create the Store instance with desired API
   */
  const storeAPI: StoreAPI<TState> = {
    get: getState, // get immutable snapshot to state
    set: setState, // apply changes to state
    applyTransaction: applyTransaction, // enable batch changes to the state,
    addComputedProperty: addComputedProperty, // compute property value from upstream changes
    watchProperty: watchProperty, // watch single property for changes
    setIsLoading, // easily set isLoading state
    setError, // easily set error state
  };

  const hookAPI: HookAPI<TState> = {
    observe: subscribe, // watch for changes WITHOUT trigger re-renders
    destroy: destroy, // clean-up store, permanently disconnect streams
    reset: () => reset(true), // allow hook-level resets of store information; without destroying streams
  };

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
    return list.length == 1 ? query.select(list[0]) : combineQueries(list.map((it) => query.select(it)));
  };
  const getSliceValueFor = <StateSlice>(
    selector: StateSelector<TState, StateSlice> | StateSelectorList<TState, StateSlice> = identity
  ): any | any[] => {
    const list = selector instanceof Array ? (selector as StateSelectorList<TState, StateSlice>) : null;
    const getCurrent = (it: StateSelector<TState, StateSlice>) => <any>it(getState());

    return list ? list.map(getCurrent) : getCurrent(selector as StateSelector<TState, StateSlice>);
  };

  /**
   * userStore()
   *
   * After the store has been created and initialized with api + state, this hoook
   * is created. Developer will use this custom react hook to 'select' state data.
   * The selected data sourcds will re-emit data after changes.
   *
   * This hook is implicitly connected to its associated [parent] store
   *
   * Warning!!
   *   1) Do not use same 'useStore' hook multiple times in the same component.
   *   2) To extract multiple slices, use
   *      a) a single selector to return a reponse (value, hashmap, or tuple)
   *      b) an array of selectors [optimized approach] to return response
   */
  const useStore: any = <StateSlice>(
    selector?: StateSelector<TState, StateSlice> | StateSelectorList<TState, StateSlice>
  ) => {
    const [initial] = useState<StateSlice>(() => getSliceValueFor(selector));
    const [slice, setSlice$] = useObservable<unknown>(null, initial);

    useIsoLayoutEffect(() => {
      setSlice$(toObservable(selector));

      return () => {
        reset();
      };
    }, [selector]);

    return slice;
  };

  /**
   * Initialization of state management
   * Create the immutable state using the 'createState()' custom store
   * factory function
   *
   * - Reinitialize the internal store,
   * - Register computed and watched properties
   * - inject storeAPI
   */
  const initializeStore = () => {
    initializer.state = produce({}, () => ({
      ...{ error: null, isLoading: false }, // start with default error/loading state
      ...createState(
        { ...storeAPI, ...hookAPI }, // provide to custom store internal functions
        initializer.registerOnInit // enable custom store to register for useStoreEffect notifications
      ),
    }));

    reinitStore(store, name, initializer.state);
    registerComputedProperties();

    // Notify store initialization is done and side affects are now allowed
    initializer.onInit();

    // Decorate hook function with API methods, public custom hook/store
    return Object.assign(useStore, hookAPI);
  };

  return initializeStore();
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
 * Ensure that a 'list' of selectors is available for upcoming iteration
 */
function normalizeSelector<T extends State, K>(
  selectors: StateSelectorList<T, K> | StateSelector<T, K>
): StateSelectorList<T, K> {
  const isArray = selectors instanceof Array;
  return isArray ? (selectors as StateSelectorList<T, K>) : [selectors as StateSelector<T, K>];
}

/**
 * Ensure that the 'list' of computedProperties is available for upcoming iteration
 */
function normalizeProperties<TState extends State, K, U>(
  list: ComputedProperty<TState, K, U> | ComputedProperty<TState, K, U>[]
): ComputedProperty<TState, K, U>[] {
  const isArray = list instanceof Array;
  return isArray ? (list as ComputedProperty<TState, K, U>[]) : [list as ComputedProperty<TState, K, U>];
}

/**
 * Computed property validation
 *  - is the property defined in the state (eg should have a placeholder starting value)
 *  - are you using 2 or more state selectors
 */
function validateComputedProperty<T extends State, K extends any, U>(store: T, property: ComputedProperty<T, K, U>) {
  if (validateWatchedProperty(store, property.name, 'ComputedProperty')) {
    if (isDev()) {
      // const selectors = normalizeSelector(property.selectors);
      // if (selectors.length < 2) {
      //   console.warn(`
      //   ComputedProperty '${property.name}' is used to derive a new property value from 2 or more state properties.
      //   For distinct, memoized computations, your 'ComputedProperty::selectors' _should_ specify 2 or more selectors .
      // `);
      // }
    }
  }
}

/**
 * Computed property validation
 *  - is the property defined in the state (eg should have a placeholder starting value)
 *  - are you using 2 or more state selectors
 */
function validateWatchedProperty<T extends State>(store: T, name: string, fieldType = 'WatchProperty') {
  const hasProperty = store.hasOwnProperty(name);
  if (!hasProperty) {
    console.warn(`
      ${fieldType} '${name}' may not be a valid property in your store. 
    `);
  }
  return hasProperty;
}
