import { debounce } from 'lodash';
import { createStore } from '@mindspace-io/react';

import { QAState } from './question-answer.interfaces';
import { callWtfApi, WTF } from './wtf.service';

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

export const useStore = createStore<QAState>(({ set, watchProperty }) => {
  const store = {
    question: '',
    answer: '',
    updateQuestion(answer: string) {
      set((s: QAState) => {
        console.log(`question = '${answer}'`);
        s.question = answer;
      });
    },
  };
  const updateAnswer = (value: string) =>
    set((d) => {
      d.answer = value;
    });
  const verify = debounce(async (newQuestion: string) => {
    updateAnswer(WTF.wait);
    if (newQuestion.indexOf('?') > -1) {
      try {
        const newAnswer = await callWtfApi();
        updateAnswer(newAnswer);
        return;
      } catch (error) {
        updateAnswer(`${WTF.error}: ${error}`);
      }
    }
    updateAnswer(WTF.hint);
  }, 200);

  return watchProperty(store, 'question', verify);
});

export { selectViewModel } from './question-answer.interfaces';
