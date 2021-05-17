import { Observable, ObservedValueOf, of, OperatorFunction, pipe } from 'rxjs';
import { concatMap, withLatestFrom } from 'rxjs/operators';

/**
 * This code is a snapshot of the code in the ngrx/platform code-base.
 *
 * NgRx Effects allows you to isolate side effect logic from your components by
 * listening to observable streams to perform some task. Effects are usually initiated
 * by an action being dispatched that contains some additional metadata. There are also
 * scenarios where Effects need to read data from the Store to provide additional context.
 *
 * This lead to surprising behavior when combined with using selectors, as the selectors
 * were subscribed to eagerly instead of waiting until the action is dispatched. As this
 * behavior is part of RxJS itself, we introduced a new concatLatestFrom operator to mitigate
 * this behavior and allow safe usage of data from the store in Effects.
 *
 * The concatLatestFrom operator functions similarly to withLatestFrom with one important
 * difference being that it lazily evaluates the provided Observable factory. This prevents
 * the provided observables from emitting before the action is dispatched.
 *
 * This allows you to use the source value when selecting additional sources to concat.
 */

// The array overload is needed first because we want to maintain the proper order in the resulting tuple
export function concatLatestFrom<T extends Observable<unknown>[], V>(
  observablesFactory: (value: V) => [...T]
): OperatorFunction<V, [V, ...{ [i in keyof T]: ObservedValueOf<T[i]> }]>;
export function concatLatestFrom<T extends Observable<unknown>, V>(
  observableFactory: (value: V) => T
): OperatorFunction<V, [V, ObservedValueOf<T>]>;
/**
 * 'concatLatestFrom' combines the source value
 * and the last available value from a lazily evaluated Observable
 * in a new array
 */
export function concatLatestFrom<
  T extends Observable<unknown>[] | Observable<unknown>,
  V,
  R = [V, ...(T extends Observable<unknown>[] ? { [i in keyof T]: ObservedValueOf<T[i]> } : [ObservedValueOf<T>])]
>(observablesFactory: (value: V) => T): OperatorFunction<V, R> {
  return pipe(
    concatMap((value) => {
      const observables = observablesFactory(value);
      const observablesAsArray = Array.isArray(observables) ? observables : [observables];
      return of(value).pipe(withLatestFrom(...observablesAsArray)) as Observable<R>;
    })
  );
}
