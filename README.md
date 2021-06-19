# Mindspace-io Utilities

[![GitHub version](https://badge.fury.io/gh/ThomasBurleson%2Fmindspace-utils.svg)](https://badge.fury.io/gh/ThomasBurleson%2Fmindspace-utils)

## Purpose

This library provides TypeScript utilities for both Angular and React developers. Click the links below to view the detailed README(s) for each technology item.

<br>

<br>

### React State Management

![react-akita splash](https://user-images.githubusercontent.com/210413/112369582-54cd4600-8caa-11eb-9c7d-54ccfb7e0277.png)

A super simply powerful State Management library React. Inspired by Vue and Zustand and controlled by Akita:

- [**`createStore()`** to quickly create a store with managed state](https://github.com/ThomasBurleson/mindspace-utils/tree/master/libs/utils/react-akita)
- [**`useStore()`** to easily build a live connection between the state and a view.](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/react-akita/src/lib/hooks/useStore.ts#L250-L263)

<br>

![image](https://user-images.githubusercontent.com/210413/68954909-8cf57800-078a-11ea-90db-df58987a9790.png)

Here is a universal Dependency Injection (DI) engine; implemented in TypeScript. This DI engine is independent of Angular and can be used easily within ANY TypeScript project.

- [**`makeInjector()`** for powerful, angular-like dependency injection](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/react/src/lib/di/README.md)

<br>

### React useObservable(), DI, EventBus, and more...

![image](https://user-images.githubusercontent.com/210413/68954901-8961f100-078a-11ea-8141-eac38ab21dab.png)

- [**`useInjectorHook()`** for fast DI lookups of singleton services](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/react/src/lib/hooks/README.md)
- [**`useObservable()`** for 'Async pipe'-like functionality](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/react/src/lib/hooks/README.md)
- [**EventBus** for easy messaging anywhere in the FE web app](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/react/src/lib/utils/eventbus.ts)

<br/>

<br/>

![image](https://user-images.githubusercontent.com/210413/68954909-8cf57800-078a-11ea-90db-df58987a9790.png)

- [**`switchCase()`** for functional API used to condense switch statements](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/react/src/lib/utils/README.md)
  - [Typescript Playground](http://bit.ly/2NPQob6)

---

<br>

### Angular Developers

![image](https://user-images.githubusercontent.com/210413/68954891-8404a680-078a-11ea-826c-879faae54eed.png)

- [**`untilViewDestroyed()`** to auto-unsubscribe Observables in View Components](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/angular/src/lib/rxjs/README.md)

- [**`switchCase()`** for functional API used to condense switch statements](https://github.com/ThomasBurleson/mindspace-utils/blob/master/libs/utils/angular/src/lib/utils/README.md)
  - [Typescript Playground](http://bit.ly/2NPQob6)

<br>

---

### Installation

To easily use this library, just use either

- **`npm install @mindspace-io/react`**
- **`npm install @mindspace-io/angular`**
