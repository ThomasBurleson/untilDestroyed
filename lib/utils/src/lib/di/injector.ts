import { 
  DependencyInjector, UndoChanges, Token,
  Provider, TypeProvider 
} from './injector.interfaces';


/**
 * Utility function used to easily create 1..n injectors; each with thier
 * own singletons and provider registry.
 * 
 * NOTE: If only a class is registered (instead of a Provider), convert to it 
 * for normalized usages
 */
export function makeInjector(registry: (Provider | TypeProvider)[], parent?: DependencyInjector): DependencyInjector {
  const normalized = registry.map(it => {
    const isProvider = !!(it as Provider).provide;
    return isProvider ? it : makeClassProvider(it);
  }) as Provider[];

  return new Injector(normalized, parent);
}

/**
 * Injector class that manages a registry of Providers and a registry
 * of singleton instances [singletons for the instance of the injector]
 */
class Injector implements DependencyInjector {
  private singletons = new WeakMap();

  constructor(private providers: Provider[] = [], private parent?: DependencyInjector) {
    this.addProviders(providers);
  }

  /**
   * Lookup singleton instance using token
   * Optionally create instance and save as singleton if needed
   * If not found, this will search a parent injector (if provided)
   */
  get(token: Token): any {
    var inst = this.findAndMakeInstance(token);
    return inst || (this.parent ? this.parent.get(token) : null);
  }


  /**
   * Force-clear internally singleton cache. 
   * If parents are specified, this enforces correct parent lookups
   * for future instantiations.
   */
  reset(): void {
    if (this.parent) {
      this.singletons = new WeakMap();
    }
  }
  /**
   * Create an unshared, non-cached instance of the token;
   * based on the Provider configuration
   * If not found, then consider asking parent injector for the
   * instance
   */
  instanceOf(token: Token): any {
    return this.instanceFromRegistry(token) || this.instanceFromParents(token);
  }

  /**
   * Dynamically allow Provider registrations and singleton overwrites
   * Provide an 'restore' function to optionally restore original providers (if replaced),
   * 
   * @param registry Configuration set of Provider(s)
   * @param replace Replace existing provider
   */
  addProviders(registry: Provider[]): UndoChanges {
    const origProviders = [...this.providers];    
    this.providers = mergeProviders(this.providers, registry);
    registry.map(it => this.singletons.delete(it.provide));

    return () => this.addProviders(origProviders);
  }


  /**
   * Get all Token providers from parent(s), updated with current overwrites (if any).
   * 
   * This allows the full parent registry tree to be flattened 
   * with current level acting as overwrites
   */
  getFlatProviderTree(): Provider[] {
    return !this.parent ? [...this.providers] : [
      ...mergeProviders(this.parent.getFlatProviderTree(), this.providers)
    ];
  }
  
  // *************************************************
  // Private  Methods
  // *************************************************

  /**
   * Ask parent injectors (if any) for a flattened Provider registry,
   * then try to build the instance. When done, restore the original 
   * Provider registry for this injector 
   */
  private instanceFromParents(token: Token): any {
    if( !this.parent ) return undefined;

    const original = [...this.providers];
    try {
      this.providers = mergeProviders(this.getFlatProviderTree(), this.providers);
      return this.instanceFromRegistry(token);
    } finally {
      this.providers = original;
    }
  }
  /**
   * Find last Provider registration (last one wins)
   */
  private findLastRegistration(token: Token, list: Provider[]) {
    const registry = this.providers.filter(it => it.provide === token);
    return registry.length ? registry[registry.length - 1] : null;
  }

  /**
   * Based on provider registration, create instance of token and save
   * as singleton value.
   * NOTE: do not scan parent since we are caching singletons at this level only.
   * 
   * @param token Class, value, or factory
   */
  private findAndMakeInstance(token: Token): any {
    let result = this.singletons.get(token) || this.instanceOf(token);
    result && this.singletons.set(token, result);

    return result;
  }

  private instanceFromRegistry(token:Token): any {
    const provider = this.findLastRegistration(token, this.providers);
    const deps = provider && provider.deps ? provider.deps.map(it => this.instanceOf(it)) : [];
    const makeWithClazz = (clazz: any) => (clazz ? new clazz(...deps) : null);
    const makeWithFactory = (fn: () => any) => (fn ? fn.call(null, deps) : null);

    return provider && ( provider.useValue
      || makeWithClazz(provider.useClass) 
      || makeWithFactory(provider.useFactory)
      || makeWithClazz(provider.provide)  // fallback uses the token as a `class`
    );    
  }


}


/**
 * Internal utility used to normalized Provider entries
 * during a `makeInjector()` call
 * 
 * @param token
 */
function makeClassProvider(token:any): Provider {
  return {
    provide: token,
    useClass: token,
    deps: [...token['deps']],
  };
}


  /**
   * Merge current provider registry with 1..n updated Provider settings;
   * where the `updated` set may contain either modified and/or new configurations
   */
  function mergeProviders(current: Provider[], updated: Provider[]): Provider[] {
    // Overwrite existing cache entry if an update is provided
    const cache = current.reduce((list, entry) => {
      const lastItem = (list) => list[list.length - 1];
      const overwrites = updated.filter(it => it.provide === entry.provide);
      const found = !!overwrites.length;

      list.push(found ? lastItem(overwrites) : entry);
      return list;
    }, []);

    // If not overwritten (in the cache), add it as a new entry.
    updated.map(it => {
      const isNew  = cache.indexOf(it) < 0;
      isNew && cache.push(it);
    });

    return cache;
  };