## React Custom Hooks

React view components use state and props to render JSX (templates).
Using RxJS and streams to deliver data and state involves risk and requires careful stream management.

Developers are required to:

- subscribe to the stream before data will be delivered/emitted
- update the component state with emitted stream values
- trigger view component re-renders
- - when a new observable instance replaces a previous instance
- when the component unmounts, all associated streams should also be unsubscribed.

> For Angular developers, this hook provides the same functionality as the template `async` pipe.

<br/>

### `useObservable` Hook

In RxJS scenarios where state values will be updated asynchronously based on emissions from Observable streams, the required code complexity becomes problematic.

_`useObservable<T>()`_ is 'typed' custom hook that dramatically simplifies the implementation of these ^ requirements. The hook itself internally manages the subscription lifecycles and dramatically reduces the code previously required withing a React view component.

```tsx
const [emitter]                = useState<Subject<string>>(() => new Subject<string>();
const [criteria, setCriteria$] = useObservable<string>(null, '');
const [people, setPeople$]     = useObservable<Contact[]>(null, []);

useEffect(() => {
  const term$ = emitter.asObservable();
  const allContacts$ = facade.contacts$.pipe(takeUntil(term$));
  const searchTerm$ = facade.autoSearch(term$);

  setCriteria$(term$);
  setPeople$(merge(allContacts$, searchTerm$));
}, []);

return (
  <Search onChange={value => emitter.next(value) } criteria={criteria} />
  <IonList> { people.map((person, idx) =>
     <ContactListItem key={idx} person={person} />
   }</IonList>
);
```
