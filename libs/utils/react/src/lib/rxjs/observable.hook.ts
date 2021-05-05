/**
 *  @description
 *
 * useObservable(): Custom hook for using observables within React view components
 *
 * React view components use state [and props] to render JSX (templates).When the state
 * values will be updated asynchronously via emissions from Observable stream this becomes
 * problematic.
 *
 * Developers must:
 *  - subscribe to the stream
 *  - update the component state with emitted stream values
 *  - unsubscribe from the stream
 *    - when a new observable instance is available
 *    - when the component unmounts
 *  - trigger view component re-renders
 *
 * This 'typed' custom hook simplifies the entire process ^ and internally manages the subscription lifecycles.
 * The hook also dramatically reduces the code complexity WITHIN a React component
 * > For Angular developers, this hook provides the same functionality as the template `async` pipe construct.
 *
 * `useObservable<T>(source:Observable<T>,initialVal:T): [val:T, setObservable]`
 *
 * @code
 *   const [people, setPeople$]     = useObservable<Contact[]>(null, []);
 *   const [criteria, setCriteria$] = useObservable<string>(null, '');
 *
 *   useIonViewWillEnter(() => {
 *     const term$ = emitter.asObservable();
 *     const allContacts$ = facade.contacts$.pipe(takeUntil(term$));
 *     const searchTerm$ = facade.autoSearch(term$);
 *
 *     setCriteria$(term$);
 *     setPeople$(merge(allContacts$, searchTerm$));
 *   });
 *
 *   return (
 *     <IonList>
 *      {
 *        people.map((person, idx) => <ContactListItem key={idx} person={person} />
 *      }
 *      </IonList>
 *   );
 *
 * @publicApi
 */
import { useState, useEffect } from 'react';

export type ResetStreamSource<T> = (source$: Observable<T>) => void;

export interface Observable<T> {
  subscribe: (
    listener: (value: T) => void,
    error?: (err: string) => void
  ) => {
    unsubscribe: () => void;
  };
}

export function useObservable<T>(observable$: Observable<T>): [T | undefined, ResetStreamSource<T>];
export function useObservable<T>(observable$: Observable<T>, initialValue: T | (() => T)): [T, ResetStreamSource<T>];
/**
 * Manage Observable subscµription and report value emission.
 * - support dynamic reset of stream source
 * - support auto-unsubscribe when view component unmounts
 * @param observable$ Stream source
 * @param initialValue initial value; to simulate 1st stream emission
 */
export function useObservable<T>(
  observable$: Observable<T>,
  initialValue?: T | (() => T)
): [T | undefined, ResetStreamSource<T>] {
  const [source$, setObservable] = useState<Observable<T>>(observable$);
  const [value, setValue] = useState<T | undefined>(initialValue);
  const reportError = (err: any) => {
    setValue(undefined);
    console.error(`useObservable() error: ${JSON.stringify(err)}`);
  };

  useEffect(() => {
    if (source$) {
      const s = source$.subscribe(setValue, reportError);
      return () => {
        s.unsubscribe();
      };
    }
  }, [source$]);

  return [value, setObservable];
}
