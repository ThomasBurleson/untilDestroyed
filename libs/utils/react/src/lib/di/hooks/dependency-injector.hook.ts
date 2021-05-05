import { useContext } from 'react';
import { Token } from '../injector.interfaces';
import { InjectorContext } from '../injector.context';

/**
 * Return either the injector instance or the token lookup FROM the
 * injector.
 *
 * A configured injector instance is required along with and a lookup token.
 * What is returned is a tuple containing the singleton instance and the injector.
 *
 * @code
 *   const injector: DependencyInjector = makeInjector([
 *     { provide: API_KEY, useValue: '873771d7760b846d51d5ac5804ab' },
 *     { provide: API_ENDPOINT, useValue: 'https://uifaces.co/api?limit=25' },
 *     { provide: ContactsService, useClass: ContactsService, deps: [API_ENDPOINT, API_KEY] }
 *   ]);
 *
 *   // Hide how DI is used under the hood
 *   // NOTE: The requires a DependencyInjectionProvider to be used for DI lookups
 *
 *   export function useContactsHook(): ContactsService {
 *     return useDependencyInjector<ContactsService>(ContactsService)
 *   }
 *
 * @returns T is either the DependencyInjector or the injector token lookup.
 */
export const useDependencyInjector = <T extends unknown>(token?: Token): T => {
  const injector = useContext(InjectorContext);

  return (!token ? injector : injector.get(token)) as T;
};
