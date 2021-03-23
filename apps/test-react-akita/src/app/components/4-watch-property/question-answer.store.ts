import * as _ from 'lodash';
import axios from 'axios';
import { createStore, State, SetState, StateSelector } from '@mindspace-io/react-akita';



/****************************************************
 * Purpose:
 * 
 * Demonstrate the use of 'watched' properties that will
 * trigger async activity!!
 * 
 ****************************************************/



/*******************************************
 * Define the state + mutators + computed properties
 *******************************************/

export interface QAState extends State {
  // Data
  question: string;
  answer: string;

  // Mutators
  updateQuestion: (answer: string) => void;
  
}

/*******************************************
 * Define the view model
 * Define a selector function to extract ViewModel from `useStore(<selector>)`
 *******************************************/

export type ViewModel = [string, string, ((question: string) => void)];

export const selectViewModel: StateSelector<QAState, ViewModel> = (s: QAState) => [s.question, s.answer, s.updateQuestion];

/*******************************************
 * Instantiate store with state
 * Note: The `filteredMessages` value is updated via a 'computed' property
 *******************************************/


export const useStore = createStore<QAState>(({set, watchProperty}) => {
  const state = {
    // data

    question: '',
    answer: '',

    // Mutators

    updateQuestion(answer: string) {
      set((s: QAState) => {
        s.question = answer;
      });
    },
  }

  // While 'observe' also works, sometimes we just want to watch something
  watchProperty<QAState>("question", _.debounce(watchQuestion(set), 500));

  return state;
});


// *************************************************
// Private Utils
// *************************************************

const WTF = {
  wait: 'Thinking...',
  hint: 'Questions only... which usually contain a question mark. ;-)',
  error: 'Error! Could not reach the API '
}
/**
 * Partial application to precapture the 'set' function
 */
function watchQuestion(set: SetState<QAState>) {
  // Provide a listener to handle changes to the question value
  return async function (question: string) {
    const updateAnswer = (value: string) => {
      set((s:QAState) => {
        s.answer = value;
      })
    }
    updateAnswer(WTF.wait);

    let message = WTF.hint;
    if (question.indexOf('?') > -1) {      
        try {

          const response = await axios.get('https://yesno.wtf/api');
          message = _.capitalize(response.data.answer);

        }catch (error) {
           message = `${WTF.error}: ${error}`;
        }
    }

    updateAnswer(message);
    
  };
}

