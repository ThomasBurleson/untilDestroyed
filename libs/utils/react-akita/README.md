# @mindspace-io/react-akita

![image](https://user-images.githubusercontent.com/210413/111729764-d4d45580-883d-11eb-8284-3f38f8963df2.png)

## Purpose

A small, super powerful statemanagement library for React... using an [Akita](https://github.com/datorama/akita) engine and [Zustand](github.com/pmndrs/zustand)-like API.
Developers familiar with Vue will recognize this state management approach using stores and mutators:

This React library now provides super-powered Store `createStore()` function to simultaneously

- Create a store with managed state, and
- Create a React hook to query its associated store state.

![store-view](https://user-images.githubusercontent.com/210413/112065962-8c65b200-8b33-11eb-86b5-1bf831b6f4de.jpg)

<br/>

### Create a Store

The beauty of the `createStore()` is that a factory function is used to build the initial state.
And the factory function is actually provided the `set`, `get`, `api` store api:

```ts
import create from '@mindspace-io/react-akita';

// Define store structure
interface StoreState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
}

const onBuildState = ({ set, get }) => {
  return {
    // Properties
    bears: 0,

    // Mutators
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
    removeAllBears: () => set({ bears: 0 }),

    // Computed Properties (none here)
    // Watch Properties (none here)
  };
};

// Build a React hook connected 'live' to the store state
const useStore = createStore<StoreState>(onBuildState);
```

> The `store` is simultaneously **BOTH** a React Hook and [store API](#using-the-store-api).

<br/>

### Using the React Hook

Then bind your components, and that's it!
Use the hook anywhere, no providers needed. Select your state and the component will re-render on changes.

```tsx
function BearCounter() {
  const bears = useStore((state) => state.bears);
  return <h1>{bears} around here ...</h1>;
}

function Controls() {
  const increasePopulation = useStore((state) => state.increasePopulation);
  return <button onClick={increasePopulation}>one up</button>;
}
```

#### Usage Considerations

NOTE: you **cannot** use the hook multiple times in the same component:

```tsx
function BearCounter() {
  const bears = useStore((state) => state.bears);
  const increasePopulation = useStore((state) => state.increasePopulation);

  return <h1>{bears} around here ...</h1>;
}
```

This ^ will generate runtime errors.

The solution is to combine the two (2) selectors into a single, composite selector:

```tsx
function BearCounter() {
  const selector = [(state) => state.bears, (state) => state.increasePopulation];
  const [bears, increasePopulation] = useStore(selector);

  return <h1 onClick={increasePopulation}>{bears} around here ...</h1>;
}
```

The important concept here is that the `selector` is used to build a live connection between those properties in the store state and the view component.
Whenever those values change, then the view will be re-rendered with the latest values.

<br/>

## Using the Store API

When a store is created, the variable reference also has the following functional API:

```ts
export interface StoreApi<T extends State> extends StatusAPI {
  set: SetState<T>;
  get: GetState<T>;

  // Used during store configuration
  addComputedProperty: AddComputedProperty<T>;
  watchProperty: WatchProperty<T>;

  // notifications do NOT trigger UI re-renders
  observe: Subscribe<T>;

  // Used to announce status
  setIsLoading: SetLoading;
  setError: SetError;

  destroy: Destroy;
}

const store: StoreAPI<StoreState> = createStore<StoreState>(onStoreReady);
```

Using the Store API allows developers to imperatively query/update state, subscribe for change notifications, or dispose of the store.

This can be very useful for scenarios where the API is used outside a Component; the React Hook may not be available.

> Please consult the [Zustand ReadMe](https://github.com/pmndrs/zustand/blob/master/readme.md) for details on additional usages.

<br/>

## Special Features

- The state is enhanced to include Status properties
- The Store API is enhanced to include Status API functions
- All state emitted (via selectors) is now immutable; using Immer internally

Often state management requires status tracking for loading activity and error conditions.

In addition to the Store API, the store is now auto enhanced with the following features:

```ts
export interface StatusAPI {
  setIsLoading: (isLoading = true) => void;
  setError: (error: unknown) => void;
}

export type Status = { isLoading: boolean; error: unknown };
```

<br/>

---

### Live Demos

A CodeSandbox demo has been prepared to allow developers to quickly and easily play with these features:

[![image](https://user-images.githubusercontent.com/210413/112064593-3abc2800-8b31-11eb-905c-623cbcc5a7ab.png)](https://codesandbox.io/s/state-w-react-akita-createstore-it03e?file=/src/components/3-computed-property/filtered-messages.tsx)

> Click on the image to open the sandbox demo.

---

### Installation

Just install with:

```terminal
npm install @mindspace-io/react-akita
```

Under the hood, this library uses `immer`, `@datorama/akita`, and `rxjs`; these will be automatically installed along with `@mindspace-io/react-akita`.
