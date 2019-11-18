import { DependencyInjector, Token } from '../di';

export type HookTuple<V, I extends DependencyInjector> = [V, I]; // Array of value + injector

/**
 * `useInjectorHook()` allows applications to build custom hooks that internally use
 * dependency injection to access singleton services, values, etc.
 * 
 * A configured injector instance is required along with and a lookup token.
 * What is returned is a tuple of the singleton instance and the injector.
 * 
 * @code
 *   const injector: DependencyInjector = makeInjector([
 *     { provide: API_KEY, useValue: '873771d7760b846d51d5ac5804ab' },
 *     { provide: API_ENDPOINT, useValue: 'https://uifaces.co/api?limit=25' },
 *     { provide: ContactsService, useClass: ContactsService, deps: [API_ENDPOINT, API_KEY] }
 *   ]);
 *   
 *   export function useContactsHook(token: any): HookTuple {
 *     return useInjectorHook(token, injector);
 *   }
 * 
 * @param injector Custom DependencyInjector
 * @param token Token type of string, Class, or InjectionToken
 */
export function useInjectorHook<T extends Token>(
  token: T,
  injector: DependencyInjector
): HookTuple<any, DependencyInjector>;
export function useInjectorHook<T extends Token, V>(
  token: T,
  injector: DependencyInjector
): HookTuple<V, DependencyInjector> {
  return [injector.get(token) as V, injector];
}