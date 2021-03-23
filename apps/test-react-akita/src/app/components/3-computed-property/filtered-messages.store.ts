import { FilteredMessages } from './filtered-messages';
import { createStore, State, ComputedProperty, StateSelectorList } from '@mindspace-io/react-akita';


const MESSAGES = [
  'Can you pickup some organic food on the way home?',
  'The veterinarian called. X-rays showed your dog is fine.',
  'Obesity is a pandemic in the USA',
  'Spotify is an amazing music service',
];


/****************************************************
 *  Purpose:
 * 
 *  Demonstrate the use of 'computed' properties!!
 * 
 ****************************************************/



/*******************************************
 * Define the state + mutators + computed properties
 *******************************************/

export interface MessagesState extends State {
  filterBy: string;
  messages: string[];
  updateFilter: (filterBy: string) => void;
  
  // Computed properties
  filteredMessages: string[]; 
}

/*******************************************
 * Define the view model
 * Define a selector function to extract ViewModel from `useStore(<selector>)`
 *******************************************/

export type ViewModel = [string, string[], ((v: string) => void)];

export const selectViewModel = <StateSelectorList<MessagesState,ViewModel>> [
  (s: MessagesState) => s.filterBy,
  (s: MessagesState) => s.filteredMessages,
  (s: MessagesState) => s.updateFilter
];

/*******************************************
 * Instantiate store with state
 * Note: The `filteredMessages` value is updated via a 'computed' property
 *******************************************/


export const useStore = createStore<MessagesState>(({set, addComputedProperty}) => {
  const state = {
    // data

    filterBy: '',
    messages: MESSAGES,

    // Mutators

    updateFilter(filterBy: string) {
      set((s) => {
        s.filterBy = filterBy;
      });
    },

    // Computed properties 
    // NOTE: these must be initializaed in state

    filteredMessages: [], 
  }
  
  addComputedProperty(makefilteredMessages());

  return state;
});


// *************************************************
// Private Utils
// *************************************************

/**
 * Build computed property for `filteredMessages`
 * Uses an array of selectors [<all messages>, <filterBy criteria>] 
 * for optimized change propagation
 */
function makefilteredMessages(): ComputedProperty<MessagesState, string[] | string, string[]> {

  // Note: onlyFilteredMessages() params depend upon the selector(s) defined!
  const onlyFilteredMessages = ([messages, filterBy]): string[] => {
    const criteria            = filterBy.toLowerCase();
    const containsFilterValue = (s:string) => (s.toLowerCase().indexOf(criteria) > -1);
    return !!filterBy ? messages.filter(containsFilterValue) : [...messages];
  };
  return {
    name: 'filteredMessages',
    selectors: [(s: MessagesState) => s.messages, (s: MessagesState) => s.filterBy] as any[],
    predicate: onlyFilteredMessages, 
  };
}

