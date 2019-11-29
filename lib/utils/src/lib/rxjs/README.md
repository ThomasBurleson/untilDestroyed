## Angular RxJS Utils

This part of the library provides Angular utilities to auto-unsubscribe [from a RxJS stream subscription] when a view component is destroyed. While originally written for Angular developers, some of the utilities can be used with **any** JS + RxJS implementation.

* `untilViewDestroyed(<ElementRef> | <Component>)`: RxJS operator to auto-unsubscribe when the Angular view instance is destroyed.
* `autoUnsubscribe(<Subscription>,<HtmlElement>)`: clear the specified subscription when the target DOM element is removed from its parent DOM container.
* `watchElementDestroyed(<HtmlElement>)`: watch target DOM element and emit true when destroyed.
* `watchViewDestroyed(<Component>)`: watch target Angular Component ngOnDestroy() is called and will emit true.

 
 
## Using @mindspace-io/rxjs-utils

The `untilViewDestroyed()` RxJS operator is the most commonly used feature. Review the code sample below on how to auto-unsubscribe an Angular View component after `ngOnDestroy()` or when the element is removed from its DOM container.

```ts
import {untilViewDestroyed} from '@mindspace-io/rxjs-utils';
   
@Component({})   
export class TicketDetails implements OnInit, OnDestroy {  
 tickets: string[];
 search: FormControl;  

 constructor(private ticketService: TicketService){}

 ngOnInit() {   
   const findTickets = (criteria:string) => this.ticketService.findAll(criteria);
  
   this.search.valueChanges.pipe(  
     untilViewDestroyed(this),  
     switchMap(findTickets), 
     map(ticket=> ticket.name)  
   )   
   .subscribe( tickets => this.tickets = tickets ); 
 } 

 ngOnDestroy() { }
 
}
```

This is a contrived example that does not itself use the power of the `async` pipe.

Nevertheless, developers will encounter other scenarios that require manual subscriptions and subscription management. And then `untilViewDestroyed()` becomes a very useful RxJS operator. 

<br/>

----

## Live Demo

[![image](https://user-images.githubusercontent.com/210413/59895538-8ebd3a00-93aa-11e9-9dd6-7fba22d34e0d.png)](https://stackblitz.com/edit/angular-using-untilviewdestroyed?file=src/app/my-list/my-list.component.ts)

<br/>

----

<br/>

### Typical Angular RxJS Subscription Leak 

Consider the following `DocumentViewerComponent` which uses a service to load a list of documents`. `availableDocuments$` is a RxJS stream which will asynchronously emit/deliver the document list WHENEVER it is available or changes. 

This implementation has a memory leak because the subscription is long-lived and is not managed!

```ts
@Component({
  selector: 'document-viewer',
  template: `
    <h1>Documents for {{fullName}}</h1>
    <document-list [dataProvider]="documents">
    </document-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentViewerComponent implements OnInit, OnDestroy {  
  @Input() fullName: string;
  documents: Documents[];

  constructor(
    private service: MyService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.service.availableDocuments$.subscribe(list => {
      this.documents = list;
      this.cd.markForCheck();
    });
  }
    
  ngOnDestroy() { }
}
```


<br/>
 
----

<br/>


### Bad Solution #1: Using `ngOnDestroy()`

Here is the typical implementation [using `ngOnDestroy()` + `takeUntil()`] to manage such RxJS subscriptions:

```ts
@Component({...})
export class DocumentViewerComponent implements OnInit, OnDestroy {  
  @Input() fullName: string;
  documents: Documents[];

  constructor(
    private service: MyService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  ngOnInit(): void {
    this._subscription = this.service.availableDocuments$.subscribe(list => {
      this.documents = list;
      this.cd.markForCheck();
    });
  }

  private _subscription: Subscription;
}
```

### Bad Solution #2: Using a notification Subject
 
```ts
@Component({...})
export class DocumentViewerComponent implements OnInit, OnDestroy {  
  @Input() fullName: string;
  documents: Documents[];

  constructor(
    private service: MyService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnDestroy(): void {
    this._notifier.next();
    this._notifier.complete();
  }

  ngOnInit(): void {
    this.service.availableDocuments$.pipe(
      takeUntil(this._notifier.asObservable())
    ).subscribe(list => {
      this.documents = list;
      this.cd.markForCheck();
    });
  }

  private _notifier = new Subject<void>();
}
```

Notice how this both of these approaches require *extra view logic* simply to using the **OnDestroy** lifecycle event to auto-unsubscribe. And when trying to manage multiple subscriptions in a single component, these approaches require code that significantly *pollutes* your view implementation.

To avoid view-code cruft, use the `@mindspace/rxjs-utils`!
