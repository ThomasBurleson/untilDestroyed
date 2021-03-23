import { createStore, State, StateSelector } from '@mindspace-io/react-akita';

/**********************************************
 *  Purpose:
 * 
 *  Demonstrate the use of simple state management
 * 
 **********************************************/


/*******************************************
 * Define the state
 *******************************************/

export interface CounterState extends State {
  visits: number;
  messages: string[];
  incrementCount: () => void;
  decrementCount: () => void;
}

/*******************************************
 * Define the view model + a selector function to extract ViewModel 
 *******************************************/

export type ViewModel = StateSelector<CounterState, [number, () => void, () => void]>;

export const selectViewModel: ViewModel = (s: CounterState) => {
  return [s.visits, s.decrementCount, s.incrementCount];
};

/*******************************************
 * Instantiate store with state
 *******************************************/

export const useStore = createStore<CounterState>(({set}) => ({
  visits: 0,
  messages: [],
  incrementCount() {  // uses reducer-like to create new state
    set((s) => ({ ...s, visits: s.visits + 1 }));
  },
  decrementCount() {  // uses Immer to support deep mutations
    set((draft) => {
      draft.visits -= 1; //
    });
  },
}));
