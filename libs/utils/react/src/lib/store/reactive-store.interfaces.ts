/**
 * State types (inspired/copied from Zustand)
 *
 * types inspired by setState from React, see:
 * https://github.com/DefinitelyTyped/DefinitelyTyped/blob/6c49e45842358ba59a508e13130791989911430d/types/react/v16/index.d.ts#L489-L495
 */
export type Status = Partial<{ isLoading: boolean; error: unknown }>;
export type CustomValue = string | number | symbol | object;
export type CustomState = Record<string | number | symbol, unknown>;
export type State = CustomState & Status;

export type SetLoading = (isLoading?: boolean) => void;
export type SetError = (error: unknown) => void;
export interface StatusAPI {
  setError: SetError;
  setIsLoading: SetLoading;
}

export type PartialState<T extends State, K extends keyof T = keyof T> =
  | (Pick<T, K> | T)
  | ((state: T) => Pick<T, K> | T);
export type StateSelector<T extends State, U> = (state: T) => U;
export type StateSelectorList<T extends State, U> = StateSelector<T, U>[];

export type EqualityChecker<T> = (state: T, newState: T) => boolean;

export type StateListener<T> = (state: T, previousState?: T) => void;
export type StateSliceListener<T> = (slice: T, previousSlice?: T) => void;

export type Unsubscribe = () => void;
export interface Subscribe<T extends State> {
  (listener: StateListener<T>): Unsubscribe;
  <StateSlice>(listener: StateSliceListener<StateSlice>, selector?: StateSelector<T, StateSlice>): Unsubscribe;
}
export interface WatchProperty<T extends State> {
  <StateSlice>(store: T, propertyName: string, listener: StateSliceListener<StateSlice>): T;
}

export interface ComputedProperty<T extends State, K, U> {
  name: string; // name of computed property
  selectors: StateSelectorList<T, K> | StateSelector<T, K>; // single or multiple selectors
  transform: (values: K[] | K) => U; // internally uses RxJS combineLatest() operator
  initialValue?: U | (() => U);
}

// Add computed property to the store
export type AddComputedProperty<T extends State> = {
  <K, U extends unknown>(store: T, property: ComputedProperty<T, K, U> | ComputedProperty<T, K, U>[]): T;
};

export type SetState<T extends State> = {
  <K extends keyof T>(partial: PartialState<T, K>, replace?: boolean): void;
};
export type GetState<T extends State> = () => T;

export interface ApplyTransactionOptions {
  enableLog?: boolean;
  thisArg?: any;
}
export type ApplyTransaction<T extends State> = (action: () => T | void, options?: ApplyTransactionOptions) => T;

export type Destroy = () => void;
export type ResetStore = () => void;

/**
 * The useStore hook is decorated with only two (2) accessible API
 * calls: observe() and destroy()
 */
export interface HookAPI<T extends State> {
  observe: Subscribe<T>;
  destroy: Destroy;
  reset: ResetStore;
}

/**
 * This API is accessible ONLY within the createStore(<createState factory>)
 */
export interface StoreAPI<T extends State> {
  set: SetState<T>;
  get: GetState<T>;
  applyTransaction: ApplyTransaction<T>;
  addComputedProperty: AddComputedProperty<T>;
  watchProperty: WatchProperty<T>;
  setIsLoading: SetLoading;
  setError: SetError;
}

/**
 * Feature to enables stores to internal perform initialization side affect
 * AFTER store is ready
 */
export type OnInitialized = () => Unsubscribe | void;
export type OnInitListener = (callWhenReady: OnInitialized, deps?: any[]) => void;

export type StateCreatorOptions = {
  storeName?: string; // Used by Akita to decorate the Store constructor
  autoReset?: boolean; // When component dismounts, should the store be reset to original values
};

/**
 * Defines a function that will be called to create a store.
 *
 * That callback (to create the store) will be provided two (2) important arguments:
 * 1) StoreAPI to set, get, addComputed properties, etc.
 * 2) StoreInitialized to provide the store factory an optional initialization callback (if needd)
 */
export type StateCreator<T extends State> = (store: StoreAPI<T>, useStoreEffect: OnInitListener) => T;

/**
 * Interface for the custom hook published from calls to `createStore()`
 */
export interface UseStore<T extends State> extends HookAPI<T> {
  (): T;
  <U>(selector?: StateSelector<T, U> | StateSelectorList<T, U>): U;
}
