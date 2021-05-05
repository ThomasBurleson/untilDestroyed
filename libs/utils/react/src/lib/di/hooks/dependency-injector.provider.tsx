import React from 'react';

import { DependencyInjector } from '../injector.interfaces';
import { InjectorContext } from '../injector.context';

/**s
 * Allows the injector instance to be 'passed' to the DIProvider HOC
 */
export interface DIProviderProps {
  injector: DependencyInjector;
}

/**
 * Dependency Injection is the fundamental mechanism for management of non-UI
 * entities (services, constants, facades, etc). Great DI provides:
 *
 * - Configure of dependencies between entities
 * - On-Demand construction/instantiation of entities
 * - Caching
 * - Singleton or Factory Access
 * - Easy lookups from the View Hierarchy
 * - Easy lookups for the Business Layers
 *
 */
export const DependencyInjectionProvider: React.FC<DIProviderProps> = ({ injector, children }) => {
  return <InjectorContext.Provider value={injector}>{children}</InjectorContext.Provider>;
};
