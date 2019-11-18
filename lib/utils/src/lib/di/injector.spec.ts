import { InjectionToken } from './injection-token';
import { DependencyInjector, UndoChanges } from './injector.interfaces';
import { makeInjector } from './injector';

describe('DependencyInjector', () => {
  let parent: DependencyInjector;
  let injector: DependencyInjector;
  let MSG_TOKEN: InjectionToken<string>;

  describe('with useClass', () => {
    beforeEach(() => {
      const [injectorA, tokenA] = makeTestInjector();

      injector = injectorA;
      MSG_TOKEN = tokenA;
    })

    it('should inject A which has InjectionToken dependencies', () => {
      const instA: A = injector.get(A);

      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("Hello Thomas");
    });

    it('should inject B which has A dependencies', () => {
      const instB: B = injector.get(B);

      expect(instB.title).toBe("B");
      expect(instB.a.title).toBe("A");
    });

    it('should inject D which has B + C dependencies', () => {
      const instD: D = injector.get(D);

      expect(instD.title).toBe("D");
      expect(instD.b.title).toBe("B");
      expect(instD.c.title).toBe("C");
    });    

    it('should support mock injection B', () => {
      injector.addProviders([ {provide: B, useClass: MockB } ]); 

      const instB: B = injector.get(B);
      expect(instB.title).toBe("MockB");
      expect(instB.a.title).toBe("MockA");

      const instD: D = injector.get(D);
      expect(instD.b.title).toBe("MockB");
    });    

    it('should allow A deps overrides with useFactory', () => {
      injector.addProviders([ { provide: MSG_TOKEN, useFactory: () => "windy" } ])
      const instA: A = injector.get(A);

      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("windy");
    });   

    it('should undo changes after addProviders()', () => {
      const undoChanges: UndoChanges = injector.addProviders([ 
        { provide: MSG_TOKEN, useFactory: () => "windy" } 
      ]);
      
      let instA: A = injector.get(A);
      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("windy");

      undoChanges();
      instA = injector.get(A);
      
      expect(instA.msg).toBe("Hello Thomas");
    });   

  });

  describe('with parent injector', () => {
    beforeEach(() => {
      const [parentA, tokenA] = makeTestInjector();

      parent = parentA;
      injector = makeInjector([
        { provide: E, useClass: E, deps:[D] },
        { provide: F, useClass: F, deps:[E, A] },
      ], parent);
      
      MSG_TOKEN = tokenA;
    })

    it('should inject A which has InjectionToken dependencies', () => {
      const instA: A = injector.get(A);

      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("Hello Thomas");
    });

    it('should inject B which has A dependencies', () => {
      const instB: B = injector.get(B);

      expect(instB.title).toBe("B");
      expect(instB.a.title).toBe("A");
    });

    it('should inject D which has B + C dependencies', () => {
      const instD: D = injector.get(D);

      expect(instD.title).toBe("D");
      expect(instD.b.title).toBe("B");
      expect(instD.c.title).toBe("C");
    });    

    it('should support mock injection B', () => {
      injector.addProviders([ {provide: B, useClass: MockB } ]);

      const instB: B = injector.get(B);
      expect(instB.title).toBe("MockB");
      expect(instB.a.title).toBe("MockA");

      const instD: D = injector.get(D);
      expect(instD.b.title).toBe("MockB");
    });    

    it('should allow A deps overrides with useFactory', () => {
      injector.addProviders([ { provide: MSG_TOKEN, useFactory: () => "windy" } ])
      const instA: A = injector.get(A);

      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("windy");
    });   

    it('should undo changes after addProviders()', () => {
      const undoChanges: UndoChanges = parent.addProviders([ 
        { provide: MSG_TOKEN, useFactory: () => "windy" } 
      ]);
      
      let instA: A = injector.get(A);
      expect(instA.title).toBe("A");
      expect(instA.msg).toBe("windy");

      undoChanges();
      injector.reset();

      instA = injector.get(A);
      
      expect(instA.msg).toBe("Hello Thomas");
    });   

  });
});


function makeTestInjector(): [ DependencyInjector, InjectionToken<string> ] {
  const token = new InjectionToken("injector.spec.ts - msg");
  const injector = makeInjector([
    { provide: token, useValue: "Hello Thomas"},
    { provide: A, useClass: A, deps:[token]},
    { provide: B, useClass: B, deps:[A]},
    { provide: C, useClass: C, deps:[A]},
    { provide: D, useClass: D, deps:[B, C]},
  ]);
  return [injector, token];
}

class A { constructor(public msg: string, public title = "A"){} }
class B { constructor(public a: A, public title="B"){ }}
class C { constructor(public a: A, public title="C"){ }}
class D { constructor(public b: B, public c: C, public title="D"){ }}
class E { constructor(public d: D, public title="E"){ }}
class F { constructor(public e: E, public a:A){ }}
class MockB { 
  a = { title: "MockA" }; 
  constructor(public msg: string, public title = "MockB"){} 
}