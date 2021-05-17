import { State, StateSelector, StateSelectorList } from '@mindspace-io/react';

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

export type QAViewModel = [string, string, (question: string) => void];

export const selectViewModel: StateSelectorList<QAState, any> = [
  (s: QAState) => s.question,
  (s: QAState) => s.answer,
  (s: QAState) => s.updateQuestion,
];
