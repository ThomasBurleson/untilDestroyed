# @mindspace-io/react

[![GitHub version](https://badge.fury.io/gh/ThomasBurleson%2Fmindspace-utils.svg)](https://badge.fury.io/gh/ThomasBurleson%2Fmindspace-utils)

## Purpose

This library provides TypeScript utilities for React (16.x or higher) developers.

- `useObservable()` for RxJS streams
- State Management using `createStore()` and `useStore()`
- **True** Dependency Injection (DI)

Click the links below to view the detailed README(s) for each technology item.

---

### Reactive Store

Easily build shared, reactive stores for your state management features:

![store-view](https://user-images.githubusercontent.com/210413/112065962-8c65b200-8b33-11eb-86b5-1bf831b6f4de.jpg)

- [**`createStore()`**](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/react/docs/stateManagement.md)

<br>

---

### React Hooks

Custom hooks for DependencyInjection (DI) and RxJS subscription management.

![image](https://user-images.githubusercontent.com/210413/68954901-8961f100-078a-11ea-8141-eac38ab21dab.png)

- [**`useInjectorHook()`** for fast DI lookups of singleton services](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/react/docs/useInjector.md)
- [**`useObservable()`** for 'Async pipe'-like functionality](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/react/docs/useObservable.md)

<br>

### Dependency Injection (DI)

Here is a univeral DI engine - independent of Angular - implemented in TypeScript. This DI engine can be used easily within ANY TypeScript project.

![image](https://user-images.githubusercontent.com/210413/68954909-8cf57800-078a-11ea-90db-df58987a9790.png)

- [**`makeInjector()`** for powerful, angular-like dependency injection](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/react/src/lib/di/README.md)

### Utilities

Here is a random collection of utilities:

- [**`switchCase()`** for functional API used to condense switch statements](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/react/src/lib/utils/README.md)
  - [Typescript Playground](http://bit.ly/2NPQob6)

<br>

---

### Installation

To easily use this library, just use `npm install @mindspace-io/react`
