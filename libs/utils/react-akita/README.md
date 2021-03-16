# @mindspace-io/react-akita

[![GitHub version](https://badge.fury.io/gh/ThomasBurleson%2Fmindspace-utils.svg)](https://badge.fury.io/gh/ThomasBurleson%2Fmindspace-utils)

## Purpose

This library provides special React utilities to easily manage lightweight state with react hooks... using Akita under-the-hood.

Without this library, developers were forced to use an imperative approach to (1) create an Akita Store+Query to manage state, and (2) use custom hooks + Facades to encapsulate the Store/Query.

This library now provides super-powered Store create function to initialize state and publish a React hook to query the state.

This library publishes an API similar to that from [Zustand](github.com/pmndrs/zustand)... but with the power of Akita used under the hood.

### Create Store API

```ts
import create from '@mindspace-io/react-akita';

const useStore = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));
```

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

---

### Installation

This library has peer dependencies upon `immer`, `@datorama/akita`, and `@mindspace-io/react`. Just install with:

```terminal
npm install @mindspace-io/react immer @datorama/akita
```
