import { InjectionToken } from './../di/injector.token';
import { renderHook, act } from '@testing-library/react-hooks';
import { makeInjector } from '../di';

import { createStore } from './reactive-store';
import { StateSelector, UseStore, State, GetState } from './reactive-store.interfaces';

// ************************************
// Define custom types for testing only
// ************************************

type MessageState = {
  messages?: string[];
  numViews?: number;
  incrementCount?: () => void;
  saveMessages?: (list: string[]) => void;

  // Computed
  numMessages?: number;
};

interface EmailState extends State {
  numViews?: number;
  emails: string[];
  saveEmails: (list: string[]) => void;
}

type EmailList = string[];
type SaveEmailsFn = (list: string[]) => void;
type EmailAndSaveFn = [EmailList, SaveEmailsFn, boolean];

// ************************************
// Test suites
// ************************************

describe('UseStore state management', () => {
  describe('createStore()', () => {
    it('should create a store', () => {
      const useStore = createStore<EmailState>(({ set }) => ({
        emails: [],
        saveEmails: (emails) => set({ emails }),
      }));

      expect(useStore).toBeTruthy();
      // Check API
      expect(useStore.observe).toBeTruthy();
      expect(useStore.destroy).toBeTruthy();
    });

    it('should create a store and subscribe for entire state', () => {
      let state: EmailState = undefined;
      const store = createStore<EmailState>(({ set }) => ({
        emails: ['ThomasBurleson@gmail.com'],
        saveEmails: (emails) => set({ emails }),
      }));

      expect(store).toBeTruthy();

      // Subscribe to all state changes
      const unsubscribe = store.observe((source) => {
        state = source;
      });

      expect(state.emails.length).toBe(1);
      expect(state.emails[0]).toBe('ThomasBurleson@gmail.com');
      expect(state.saveEmails).toBeDefined();

      expect(state.error).toBeDefined();
      expect(state.isLoading).toBeDefined();
      expect(state.isLoading).toBe(false);

      state.saveEmails([]);
      expect(state.emails.length).toBe(0);

      unsubscribe(); // ignore future state changes

      state.saveEmails(['ThomasBurleson@gmail.com']);
      expect(state.emails.length).toBe(0);
    });

    it('should create a store and subscribe for partial slice of state', () => {
      let store: EmailState;
      let emails: string[] = undefined;

      const hook = createStore<EmailState>(({ set }) => {
        return (store = {
          emails: ['ThomasBurleson@gmail.com'],
          saveEmails: (emails) => set({ emails }),
        });
      });

      // Subscribe to all state changes
      const unsubscribe = hook.observe<string[]>(
        source => { emails = source }, // prettier-ignore
        (s) => s.emails
      );

      expect(emails.length).toBe(1);
      expect(emails[0]).toBe('ThomasBurleson@gmail.com');
      expect(store.saveEmails).toBeDefined();

      store.saveEmails([]);
      expect(emails.length).toBe(0);

      unsubscribe(); // ignore future state changes

      store.saveEmails(['ThomasBurleson@gmail.com']);
      expect(emails.length).toBe(0);
    });

    it('should reset store from the hook', () => {
      const hook = createStore<EmailState>(({ set }) => ({
        emails: [],
        saveEmails: (emails) => set({ emails }),
      }));
      const { result, waitForNextUpdate } = renderHook<UseStore<EmailState>, EmailState>(hook);

      act(() => {
        result.current.saveEmails(['ThomasBurleson@gmail.com']);
      });
      expect(result.current.emails.length).toBe(1);

      act(() => {
        // Explicitly for the associated store to reset state
        hook.reset();
      });
      expect(result.current.emails.length).toBe(0);
    });

    it('should not reset normal store when unmounted', () => {
      const hook = createStore<EmailState>(({ set }) => ({
        emails: [],
        saveEmails: (emails) => set({ emails }),
      }));
      const { result, unmount, rerender } = renderHook<UseStore<EmailState>, EmailState>(hook);

      expect(result.current.emails.length).toBe(0);
      act(() => {
        result.current.saveEmails(['ThomasBurleson@gmail.com']);
      });
      expect(result.current.emails.length).toBe(1);

      unmount();
      rerender();

      // Without StateCreatorOptions 'autoReset: true', store is cached and shared
      // regardless of components unmounting
      expect(result.current.emails.length).toBe(1);
    });

    it('should reset store from resettable store when unmounted', () => {
      const hook = createStore<EmailState>(
        ({ set }) => ({
          emails: [],
          saveEmails: (emails) => set({ emails }),
        }),
        { autoReset: true } // when component unmounts, autoreset store
      );
      const { result, unmount, rerender } = renderHook<UseStore<EmailState>, EmailState>(hook);

      expect(result.current.emails.length).toBe(0);
      act(() => {
        result.current.saveEmails(['ThomasBurleson@gmail.com']);
      });
      expect(result.current.emails.length).toBe(1);

      unmount();
      rerender();

      // Only because we set the StateCreatorOptions 'autoReset'
      expect(result.current.emails.length).toBe(0);
    });
  });

  describe('createStore() with onInit notifications', () => {
    it('should notify initialization done', () => {
      let notified = false;
      const useStore = createStore<EmailState>(({ set }, useStoreEffect) => {
        // side affect to run on initialization
        useStoreEffect(() => {notified = true; },[]); // prettier-ignore

        return {
          emails: [],
          saveEmails: (emails) => set({ emails }),
        };
      });

      // initialization notification is synchronous
      expect(notified).toBe(true);
    });

    it('should cleanup sideaffect during destroy', () => {
      let notified = 0;
      const useStore = createStore<EmailState>(({ set }, useStoreEffect) => {
        useStoreEffect(() => {
          notified = 1; // sideaffect
          return () => (notified += 1); // should be called on `destroy()`
        }, []);

        return {
          emails: [],
          saveEmails: (emails) => set({ emails }),
        };
      });

      expect(notified).toBe(1);
      useStore.destroy();
      expect(notified).toBe(2);
    });

    it('should not cleanup sideaffect during reset', () => {
      let notified = 0;
      const useStore = createStore<EmailState>(({ set }, useStoreEffect) => {
        useStoreEffect(() => {
          notified = 1; // sideaffect
          return () => (notified += 1); // should not be called on `reset()`
        }, []);

        return {
          emails: [],
          saveEmails: (emails) => set({ emails }),
        };
      });

      expect(notified).toBe(1);
      useStore.reset();
      expect(notified).toBe(1);
    });
  });
  describe('creates a store hook `useStore`', () => {
    let useStore: UseStore<EmailState>;

    beforeEach(() => {
      useStore = createStore(({ set }) => ({
        emails: ['ThomasBurleson@gmail.com'],
        saveEmails: (emails) => set({ emails }),
      }));
    });

    afterEach(() => {
      useStore.destroy();
    });

    it('should return entire state; when a selector is not specified', () => {
      const { result } = renderHook<UseStore<EmailState>, EmailState>(useStore);

      expect(result.current.emails.length).toBe(1);
      expect(result.current.emails[0]).toBe('ThomasBurleson@gmail.com');
      expect(result.current.saveEmails).toBeDefined();

      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.saveEmails(['Harry@hotpixelgroup.com', 'Thomas.Burleson@ampf.com']);
      });

      expect(result.current.emails.length).toBe(2);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return a simply `slice` only when a simply selector is specified', () => {
      const { result: emails } = renderHook<StateSelector<EmailState, EmailList>, EmailList>(useStore, {
        initialProps: (s) => s.emails,
      });

      expect(emails.current instanceof Array).toBe(true);
      expect(emails.current.length).toBe(1);
    });

    it('should return a complex `slice` only when a combined selector is specified', () => {
      const { result } = renderHook<StateSelector<EmailState, EmailAndSaveFn>, EmailAndSaveFn>(useStore, {
        initialProps: (s) => [s.emails, s.saveEmails, s.isLoading],
      });

      const [emails, saveEmails, isLoading] = result.current;
      expect(emails).toBeDefined();
      expect(saveEmails).toBeInstanceOf(Function);
      expect(isLoading).toBe(false);

      expect(emails.length).toBe(1);

      act(() => {
        saveEmails(['Harry@hotpixelgroup.com', 'Thomas.Burleson@ampf.com']);
      });

      expect(result.current[0].length).toBe(2);
    });

    it('should update state with value', () => {
      const { result } = renderHook<UseStore<EmailState>, EmailState>(useStore);

      expect(result.current.emails.length).toBe(1);

      act(() => {
        result.current.saveEmails(['Harry@hotpixelgroup.com', 'Thomas.Burleson@ampf.com']);
      });

      expect(result.current.emails.length).toBe(2);
      expect(result.current.emails[0]).toBe('Harry@hotpixelgroup.com');
    });

    it('update state with partial selector; confirm with getState()', () => {
      let store: MessageState;
      let getState: GetState<MessageState>;
      const hook = createStore<MessageState>(({set,get}) => {
        getState = get;
        return store = ({  
          numViews: 0,
          messages: [],         
          saveMessages: (v) => v ,          
          incrementCount: () => set((s: MessageState) => ({ numViews: s.numViews + 1 }))
        });
      }); // prettier-ignore

      expect(store.numViews).toBe(0);

      act(() => {
        store.incrementCount();
      });

      const updated = getState();
      expect(updated.numViews).toBe(1);
    });

    it('update state with partial selector that returns new state', () => {
      const useStore = createStore<MessageState>(({ set }) => ({
        numViews: 0,
        incrementCount: () => set((s: MessageState) => ({ numViews: s.numViews + 1 })),
      }));
      const { result } = renderHook(useStore, { initialProps: (s) => [s.numViews, s.incrementCount] });

      expect(result.current[0]).toBe(0);
      act(() => {
        const incrementCount = result.current[1];
        incrementCount();
      });
      expect(result.current[0]).toBe(1);
    });

    it('update state with partial selector that modifies the draft', () => {
      const useStore = createStore<MessageState>(({ set }) => ({
        numViews: 0,
        incrementCount: () =>
          set((draft: MessageState) => {
            draft.numViews += 1; // just modify the draft... Immer manages the immutability
          }),
      }));
      const { result } = renderHook(useStore, { initialProps: (s) => [s.numViews, s.incrementCount] });

      expect(result.current[0]).toBe(0);
      act(() => {
        const incrementCount = result.current[1];
        incrementCount();
      });
      expect(result.current[0]).toBe(1);
    });
  });

  describe('enforces immutability', () => {
    it('should create immutable state', () => {
      let getState: GetState<MessageState>;
      const useStore = createStore<MessageState>(({set, get}) => {
        getState = get;
        return ({ messages: [], saveMessages: (v) => v });
      }); // prettier-ignore

      const state = getState();
      const origSaveMessages = state.saveMessages;
      const origMessages = state.messages;

      expect(state.messages.length).toBe(0);

      try { state.messages = [];           } catch (e) {} // prettier-ignore
      try { state.messages.push('Msg #1'); } catch (e) {} // prettier-ignore
      try { state.saveMessages = (v) => v  } catch (e) {} // prettier-ignore

      expect(state.messages).toBe(origMessages);
      expect(state.messages.length).toBe(0);
      expect(state.saveMessages === origSaveMessages).toBe(true);
    });

    it('should emit immutable state from an "empty" hook ', () => {
      const useStore = createStore<MessageState>(({set}) => ({ messages: [], saveMessages: (v) => v })); // prettier-ignore
      const { result } = renderHook<UseStore<MessageState>, MessageState>(useStore);
      const origSaveMessages = result.current.saveMessages;
      const origMessages = result.current.messages;

      expect(result.current.messages.length).toBe(0);

      try { result.current.messages = [];           } catch (e) {} // prettier-ignore
      try { result.current.messages.push('Msg #1'); } catch (e) {} // prettier-ignore
      try { result.current.saveMessages = (v) => v  } catch (e) {} // prettier-ignore

      expect(result.current.messages).toBe(origMessages);
      expect(result.current.messages.length).toBe(0);
      expect(result.current.saveMessages === origSaveMessages).toBe(true);
    });

    it('should emit immutable state from an hook + selector ', () => {
      const useStore = createStore<MessageState>(({set}) => ({ messages: [], saveMessages: (v) => v })); // prettier-ignore
      const { result } = renderHook<StateSelector<MessageState, string[]>, string[]>(useStore, {
        initialProps: (s) => s.messages,
      });
      const messages = result.current;
      expect(messages.length).toBe(0);

      try { messages.push('Msg #1'); } catch (e) {} // prettier-ignore
      expect(messages.length).toBe(0);
    });
  });

  describe('with Computed properties', () => {
    let useStore;
    let enableWarnings;
    let watchedCounter = 0;
    let getState: GetState<MessageState>;

    beforeEach(() => {
      enableWarnings = silentWarnings();
      console.warn = () => {};

      useStore = createStore<MessageState>(({ set, get, addComputedProperty, watchProperty }) => {
        getState = get;

        const store = {
          numViews: 1,
          numMessages: 0,
          messages: ['Message #1', 'Message #2'],
          saveMessages: (v: string[]) =>
            set((s) => {
              s.messages = [...s.messages, ...v];
            }),
          incrementCount: () =>
            set((s) => {
              s.numViews += 1;
            }),
        };

        addComputedProperty(store, {
          name: 'numMessages',
          selectors: (s: MessageState) => s.messages,
          transform: (messages: string[]) => {
            return messages.length;
          },
        });

        watchProperty(store, 'messages', () => {
          watchedCounter += 1;
        });

        return store;
      });
    });

    afterEach(() => {
      watchedCounter = 0;
      useStore.destroy();
      enableWarnings();
    });

    it('should access initialized computed properties', () => {
      expect(getState().numMessages).toBe(0);
    });

    it('should access rendered async computed properties', async () => {
      const { result, waitForNextUpdate } = renderHook<UseStore<MessageState>, MessageState>(useStore);

      // need to wait for computed property async initialization
      await waitForNextUpdate();

      expect(result.current.numViews).toBe(1);
      expect(result.current.numMessages).toBe(2);

      act(() => {
        // Change that DOES trigger the computed property
        result.current.saveMessages(['Test Message #3', 'Test Message #4']);
      });

      // need to wait for computed property async change after `saveMessages()`
      await waitForNextUpdate();

      expect(result.current.numViews).toBe(1);
      expect(result.current.numMessages).toBe(4);

      act(() => {
        // Change that does NOT affect the computed property
        result.current.incrementCount();
      });

      expect(result.current.numViews).toBe(2);
      expect(result.current.numMessages).toBe(4);
    });

    it('should access handle watched properties', async () => {
      const { result, waitForNextUpdate } = renderHook<UseStore<MessageState>, MessageState>(useStore);

      // need to wait for computed property async initialization
      await waitForNextUpdate();

      expect(result.current.numMessages).toBe(2);
      expect(watchedCounter).toBe(1);

      act(() => {
        // Change that DOES trigger the computed property
        result.current.saveMessages(['Test Message #3', 'Test Message #4']);
      });

      // need to wait for computed property async change after `saveMessages()`
      await waitForNextUpdate();

      expect(result.current.numMessages).toBe(4);
      expect(watchedCounter).toBe(2);

      act(() => {
        // Change that does NOT affect the computed property
        result.current.incrementCount();
      });

      expect(result.current.numMessages).toBe(4);
      expect(watchedCounter).toBe(2);
    });
  });

  describe('from DependencyInjection', () => {
    const hookToken = new InjectionToken('[useStore hook]');
    const createStoreWith = () => {
      const useStore = createStore(({ set }) => ({
        emails: ['ThomasBurleson@gmail.com'],
        saveEmails: (emails) => set({ emails }),
      }));
      return useStore;
    };
    const injector = makeInjector([{ provide: hookToken, useFactory: () => createStoreWith() }]);

    expect(injector.get(hookToken)).toBe(injector.get(hookToken));
  });
});

/**
 * Computed and Watched property setup will issue
 * warnings if the selectors are not optimized.
 *
 * For testing, we want to silence this output.
 */
function silentWarnings() {
  const original = console.warn;
  console.warn = () => {};
  return () => {
    console.warn = original;
  };
}
