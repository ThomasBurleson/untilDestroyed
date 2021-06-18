// ************************************
//  Demonstrate how traditional React hooks do not
//  naturally share state
//
//  Toggle the imports to test Hooks vs Store
// ************************************

import { FC } from 'react';

import { useCounter as useShared } from './counter.store';
import { useCounter as useUnshared } from './counter.hook';

export const Item1: FC = () => {
  const shared = useShared();
  const unshared = useUnshared();

  return (
    <div className="row">
      <div>
        <h4>Using Custom Hooks</h4>
        <p>
          Unshared #1: count = <span className="count-error">{unshared.count}</span>
        </p>
        <button onClick={unshared.incrementCount}>Increment</button>
      </div>
      <div>
        <h4>Using Reactive Stores</h4>
        <p>
          Shared #1: count = <span className="count">{shared.count}</span>
        </p>
        <button onClick={shared.incrementCount}>Increment</button>
      </div>
    </div>
  );
};

export const Item2: FC = () => {
  const shared = useShared();
  const unshared = useUnshared();

  return (
    <div className="row">
      <div>
        <p>
          Unshared #2: count = <span className="count-error-2">{unshared.count}</span>
        </p>
        <button onClick={unshared.incrementCount}>Increment</button>
      </div>
      <div>
        <p>
          Shared #2: count = <span className="count">{shared.count}</span>
        </p>
        <button onClick={shared.incrementCount}>Increment</button>
      </div>
    </div>
  );
};

export const SharedState: FC = () => {
  return (
    <div className="sampleBox">
      <Item1 />
      <Item2 />
    </div>
  );
};
