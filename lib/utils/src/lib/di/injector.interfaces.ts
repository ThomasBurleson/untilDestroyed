import { Type } from './type';
import { InjectionToken } from './injection-token';

export type Token = String | InjectionToken<string> | (new (...args: any[]) => any);

export interface TypeProvider extends Type<any> {
  deps?: any[];
}

export interface Provider {
  provide: Token;
  useClass?: any;
  useValue?: any;
  useFactory?: () => any;
  deps?: any[];
}

export type UndoChanges = () => void;

export interface DependencyInjector {
  get: (token: Token) => any;
  reset: () => void;
  instanceOf: (token: Token) => any;
  addProviders: (registry: Provider[]) => UndoChanges;
  getFlatProviderTree: () => Provider[];
}

