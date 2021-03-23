import React from 'react';

import { Header } from './components/_ui/header';
import { TabItem } from './components/_ui/tabItem';

import { SimpleCounter } from './components/1-simple-counter/simple-counter';
import { AsyncMessages } from './components/2-async-loading/async-messages';
import { FilteredMessages } from './components/3-computed-property/filtered-messages';
import { QuestionAnswer } from './components/4-watch-property/question-answer';

import './app.scss';

// ************************************

const App: React.FC = () => {
  return (
    <div className="grid-container">
      <div className="header">
        <Header />
      </div>
      <div className="content">
        <TabItem url="1-simple-counter/simple-counter.tsx">
          <SimpleCounter />
        </TabItem>
        <TabItem url="2-async-loading/async-email.tsx">
          <AsyncMessages />
        </TabItem>
        <TabItem url="3-computed-property/filtered-messages.tsx">
          <FilteredMessages />
        </TabItem>
        <TabItem url="4-watch-property/question-answer.tsx">
          <QuestionAnswer />
        </TabItem>
      </div>
    </div>
  );
};

export default App;
