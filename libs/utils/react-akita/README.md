# React State Management

![react-akita splash](https://user-images.githubusercontent.com/210413/112369582-54cd4600-8caa-11eb-9c7d-54ccfb7e0277.png)

> Just install `@mindspace-io/react-akita` to use.

## Purpose

A small, super powerful statemanagement library for React... using an [Akita](https://github.com/datorama/akita) engine and [Zustand](github.com/pmndrs/zustand)-like API.

1. Publishes a React-intuitive hook
2. Uses **ImmerJS** to enforce immutability at the view layers.
3. Encourages super-clean View components
4. Encourages user interactions to be delegated to the business layers.
5. Powered by the amazing **Akita** State Management library

This React library now provides super-powered Store `createStore()` function to simultaneously

- Create a store with managed state, and
- Use the published React hook implicitly connected to its associated store state.
- `useStore(<selector>)` to easily re-render the view when the state changes.

<br/>

Developers familiar with Vue will recognize this state management approach using stores and mutators:

![store-view](https://user-images.githubusercontent.com/210413/112065962-8c65b200-8b33-11eb-86b5-1bf831b6f4de.jpg)

<br/>

### Create a Store

The beauty of the `createStore()` is that a factory function is used to build the initial state.

And the factory function is actually provided the [`set`, `get`, ...] store api:

```ts
import { createStore, State } from '@mindspace-io/react-akita';

// Define store structure
interface StoreState extends State {
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

> In fact, the `hook` is both a **BOTH** a React Hook and a [Store API](#using-the-store-api).

<br/>

### Using the React Hook

Now bind your components to use the state returned by the hook... and that's it!

Use the hook anywhere, no providers needed. Select your state and the component will re-render on state changes.

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

You can also use multiple `useStore()` hooks - each from different stores.

```ts
import { useEmailStore, EmailState } from './email.store';
import { useEmployeeStore, EmployeeState } from './employee.store';

function AuditReport() {
  const emails = useEmailStore((state: EmailState) => state.emails);
  const people = useEmployeeStore((state: EmployeeState) => state.executives);

  return <p>
    {people.length} Executives found! <br>
    {emails.length} Emails missing.
  </p>;
}
```

#### Caution!

![caution](https://user-images.githubusercontent.com/210413/112377081-4a637a00-8cb3-11eb-88d5-8e3addc20884.jpg)

You **cannot** use the same hook multiple times in the same component:

```tsx
function BearCounter() {
  const bears = useBearStore((state) => state.bears);
  const increasePopulation = useBearStore((state) => state.increasePopulation);

  return <h1>{bears} around here ...</h1>;
}
```

This ^ will generate runtime errors since the same `useStore` reference can only be used once in a view.

#### Solution

![success](https://user-images.githubusercontent.com/210413/112377333-9adad780-8cb3-11eb-9b4f-c7087477d5d3.png)

The solution is to combine the two (2) selectors into a single, composite selector:

```tsx
function BearCounter() {
  const selector = [(state) => state.bears, (state) => state.increasePopulation];
  const [bears, increasePopulation] = useBearStore(selector);

  return <h1 onClick={increasePopulation}>{bears} around here ...</h1>;
}
```

Whenever those two (2) values change, then the view will be re-rendered with the latest values.

---

The important concept here is that the `selector` is used to build a live connection between those properties in the Store state and the View component.

---

<br/>

## Using the Store API

When a store is created, the variable reference also has the following functional API:

```ts
export interface StoreApi<T extends State> extends StatusAPI {
  set: SetState<T>;
  get: GetState<T>;

  // Used to batch state changes
  applyTransaction: ApplyTransaction<T>;

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

<br/>

## Special Features

- All state emitted (via selectors) is now immutable; locked using Immer internally. Yet your _mutators_ do not have to worry about that... the mutators work with unlocked/draft state.

Often state management requires status tracking for loading activity and error conditions.

- Your custom state is enhanced to include Status properties: `error` + `isLoading`
- The Store API is enhanced to include Status API functions: `setIsLoading()` + `setError()`

In addition to standard Store API, the store is also auto enhanced with the following features:

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

A [CodeSandbox demo](https://codesandbox.io/s/state-w-react-akita-createstore-it03e?file=/src/components/3-computed-property/filtered-messages.tsx) has been prepared to allow developers to quickly and easily play with these features:

[![image](https://user-images.githubusercontent.com/210413/112064593-3abc2800-8b31-11eb-905c-623cbcc5a7ab.png)](https://codesandbox.io/s/state-w-react-akita-createstore-it03e?file=/src/components/3-computed-property/filtered-messages.tsx)

---

### Installation

Just install with:

```terminal
npm install @mindspace-io/react-akita
```

Under the hood, this library uses `immer`, `@datorama/akita`, and `rxjs`; these will be automatically installed along with `@mindspace-io/react-akita`.
