/* eslint-disable */

import { Observable } from 'rxjs';
import { EventBus } from '../eventbus';

enum SESSION {
  STARTED = 'sessionStarted',
  STOPPED = 'sessionStopped',
  UNKNOWN = 'unknown event',
}

type Unsubscribe = () => void;

const createEvent = (type: string, data?: any) => ({ type, data });

describe('EventBus', () => {
  let eventBus: EventBus;
  let unsubscribe: Unsubscribe;

  beforeEach(() => {
    eventBus = new EventBus();
    unsubscribe = () => {};
  });

  afterEach(() => {
    eventBus.reset();
  });

  it('should emit events', () => {
    let count = 0;
    let value = 0;

    eventBus.emit(createEvent(SESSION.STARTED, 43));
    eventBus.emit(createEvent(SESSION.STOPPED));

    expect(count).toBe(0);
    expect(value).toBe(0);
  });

  describe('event subscriptions', () => {
    it('should subscribe to an event', () => {
      const unsubscribe: Unsubscribe = eventBus.on<unknown>(SESSION.STARTED, (session: unknown) => {});

      expect(unsubscribe).toBeDefined();
    });

    it('should subscribe to desired event', () => {
      let count = 0,
        value = 0;
      const onStart = (val: number) => {
        count += 1;
        value = val;
      };
      unsubscribe = eventBus.on<number>(SESSION.STARTED, onStart);

      eventBus.emit(createEvent(SESSION.STARTED, 43));
      eventBus.emit(createEvent(SESSION.STOPPED));

      expect(count).toBe(1);
      expect(value).toBe(43);
    });

    it('should subscribe to multiple events using "on()"', () => {
      let count = 0;
      const trackCount = () => (count += 1);
      const unsubscribe1 = eventBus.on<number>(SESSION.STARTED, trackCount);
      const unsubscribe2 = eventBus.on<number>(SESSION.STOPPED, trackCount);

      eventBus.emit(createEvent(SESSION.STARTED, 43));
      eventBus.emit(createEvent(SESSION.STOPPED));
      expect(count).toBe(2);

      unsubscribe1();
      unsubscribe2();

      eventBus.emit(createEvent(SESSION.STARTED, 43));
      eventBus.emit(createEvent(SESSION.STOPPED));
      expect(count).toBe(2);
    });

    it('should subscribe to multiple events using onMany()', () => {
      let count = 0;
      const trackCount = () => (count += 1);
      const unsubscribe = eventBus.onMany({
        [SESSION.STARTED]: trackCount,
        [SESSION.STOPPED]: trackCount,
      });

      eventBus.emit(createEvent(SESSION.STARTED, 43));
      eventBus.emit(createEvent(SESSION.STOPPED));
      expect(count).toBe(2);

      unsubscribe();

      eventBus.emit(createEvent(SESSION.STARTED, 43));
      eventBus.emit(createEvent(SESSION.STOPPED));
      expect(count).toBe(2);
    });

    it('should subscribe to "most recent" past event for each type', () => {
      let count = 0;
      const trackCount = () => (count += 1);

      // Fire event BEFORE subscription
      eventBus.emit(createEvent(SESSION.STARTED, 43));

      const unsubscribe = eventBus.on<number>(SESSION.STARTED, trackCount);
      expect(count).toBe(1);

      unsubscribe();

      eventBus.emit(createEvent(SESSION.STARTED, 43));
      expect(count).toBe(1);
    });

    it('should subscribe to "most recent" event only 1x', () => {
      let recent: any;
      const userChanged = 'userChanged';
      const trackValue = (val) => (recent = val);

      // Fire event BEFORE subscription
      eventBus.emit(createEvent(userChanged, 'thomas burleson'));

      const unsubscribe = eventBus.on<number>(userChanged, trackValue);
      expect(recent).toBe('thomas burleson');

      eventBus.emit(createEvent(userChanged, 'wes grimes'));
      expect(recent).toBe('wes grimes');

      unsubscribe();

      eventBus.emit(createEvent(userChanged, 'jon rista'));
      expect(recent).toBe('wes grimes');
    });

    it('should subscribe to "most recent" past events using onMany()', () => {
      let count = 0;
      const trackCount = () => {
        count += 1;
      };

      eventBus.emit(createEvent(SESSION.STARTED, 43));
      eventBus.emit(createEvent(SESSION.STOPPED));

      const unsubscribe = eventBus.onMany({
        [SESSION.STARTED]: trackCount,
        [SESSION.STOPPED]: trackCount,
      });

      expect(count).toBe(2);
      unsubscribe();

      eventBus.emit(createEvent(SESSION.STARTED, 43));
      eventBus.emit(createEvent(SESSION.STOPPED));

      expect(count).toBe(2);
    });

    it('should unsubscribe from future events', () => {
      let count = 0;
      let value = 0;
      const onStart = (val: number) => {
        count += 1;
        value = val;
      };
      unsubscribe = eventBus.on<number>(SESSION.STARTED, onStart);

      eventBus.emit(createEvent(SESSION.STARTED, 43));
      eventBus.emit(createEvent(SESSION.STOPPED));

      expect(count).toBe(1);
      expect(value).toBe(43);

      unsubscribe();
      eventBus.emit(createEvent(SESSION.STARTED, 100));

      expect(count).toBe(1);
      expect(value).toBe(43);
    });
  });

  describe('event stream observables', () => {
    it('should publish an observable for an event', () => {
      const session$: Observable<number> = eventBus.observableFor<number>(SESSION.STARTED);

      expect(session$).toBeDefined();
      expect(session$.subscribe).toBeDefined();
    });

    it('should stream subscribed events', () => {
      let value = 0;
      const session$: Observable<number> = eventBus.observableFor<number>(SESSION.STARTED);
      const subscription = session$.subscribe((data) => (value = data));

      expect(value).toBe(0);

      eventBus.emit(createEvent(SESSION.STARTED, 43));
      expect(value).toBe(43);

      eventBus.emit(createEvent(SESSION.UNKNOWN, 100));
      expect(value).toBe(43);

      subscription.unsubscribe();
    });
  });
});
