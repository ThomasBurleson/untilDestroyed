import { produce } from 'immer';
import { renderHook, act } from '@testing-library/react-hooks';

// import * as matchers from 'jest-immutable-matchers';
// These ^ matchers do not work with Immer; so we must manually check immutability

import { StateSelector, UseStore, Status } from './store.interfaces';
import { createStore } from './useStore';

// ************************************
// Define custom types for testing only
// ************************************

type MessageState = {
  messages: string[];
  saveMessages: (list: string[]) => string[];
};

type EmailState = {
  emails: string[];
  saveEmails: (list: string[]) => void;
} & Partial<Status>;

type EmailList = string[];
type SaveEmailsFn = (list: string[]) => void;
type EmailAndSaveFn = [EmailList, SaveEmailsFn, boolean];

// ************************************
// Test suites
// ************************************

describe('UseStore state management', () => {
  describe('create()', () => {
    it('should create a store', () => {
      const useStore = createStore<EmailState>((set) => ({
        emails: [],
        saveEmails: (emails) => set({ emails }),
      }));

      expect(useStore).toBeTruthy();
      // Check API
      expect(useStore.setIsLoading).toBeTruthy();
      expect(useStore.setError).toBeTruthy();
      expect(useStore.getState).toBeTruthy();
      expect(useStore.setState).toBeTruthy();
      expect(useStore.subscribe).toBeTruthy();
      expect(useStore.destroy).toBeTruthy();
    });

    it('should create a store and subscribe for entire state', () => {
      let state: EmailState = undefined;
      const store = createStore<EmailState>((set) => ({
        emails: ['ThomasBurleson@gmail.com'],
        saveEmails: (emails) => set({ emails }),
      }));

      expect(store).toBeTruthy();

      // Subscribe to all state changes
      const unsubscribe = store.subscribe((source) => {
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
      const store = createStore<EmailState>((set) => ({
        emails: ['ThomasBurleson@gmail.com'],
        saveEmails: (emails) => set({ emails }),
      }));
      const api: EmailState = store.getState();

      let emails: string[] = undefined;

      // Subscribe to all state changes
      const unsubscribe = store.subscribe<string[]>(
        source => { emails = source }, // prettier-ignore
        (s) => s.emails
      );

      expect(emails.length).toBe(1);
      expect(emails[0]).toBe('ThomasBurleson@gmail.com');
      expect(api.saveEmails).toBeDefined();

      api.saveEmails([]);
      expect(emails.length).toBe(0);

      unsubscribe(); // ignore future state changes

      api.saveEmails(['ThomasBurleson@gmail.com']);
      expect(emails.length).toBe(0);
    });
  });

  describe('creates a store hook `useStore`', () => {
    let useStore: UseStore<EmailState>;

    beforeEach(() => {
      useStore = createStore((set) => ({
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

    it('should update state', () => {
      const { result } = renderHook<UseStore<EmailState>, EmailState>(useStore);

      expect(result.current.emails.length).toBe(1);

      act(() => {
        result.current.saveEmails(['Harry@hotpixelgroup.com', 'Thomas.Burleson@ampf.com']);
      });

      expect(result.current.emails.length).toBe(2);
      expect(result.current.emails[0]).toBe('Harry@hotpixelgroup.com');
    });
  });

  describe('enforces immutability', () => {
    beforeEach(() => {
      // jest.addMatchers(matchers);
    });

    it('should create immutable state', () => {
      const useStore = createStore<MessageState>(set => ({ messages: [], saveMessages: (v) => v })); // prettier-ignore
      const state = useStore.getState();
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
      const useStore = createStore<MessageState>(set => ({ messages: [], saveMessages: (v) => v })); // prettier-ignore
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
      const useStore = createStore<MessageState>(set => ({ messages: [], saveMessages: (v) => v })); // prettier-ignore
      const { result } = renderHook<StateSelector<MessageState, string[]>, string[]>(useStore, {
        initialProps: (s) => s.messages,
      });
      const messages = result.current;
      expect(messages.length).toBe(0);

      try { messages.push('Msg #1'); } catch (e) {} // prettier-ignore
      expect(messages.length).toBe(0);
    });
  });
});
