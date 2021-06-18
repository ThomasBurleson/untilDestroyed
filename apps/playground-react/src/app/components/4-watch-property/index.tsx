import React from 'react';

import { CodeBox } from '../_ui/code-box';
import { QuestionAnswer } from './demo';

// ************************************
//  (1) Main approach:
//
// ************************************

const DemoBox: React.FC = () => {
  return (
    <div>
      <div className="sampleBox bg-gray-200 mb-4">
        <section className="flex items-center justify-center">
          <QuestionAnswer />
        </section>
        <div className="wave">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 1680 30">
            <path
              fill="rgba(229, 231, 235, var(--tw-bg-opacity))"
              d="M0 0H1680C1680 0 1680 5.98986 1680 19.9593C1661.32 17.3427 1651.61 9.95991 1632.75 9.95991C1613.89 9.95991 1604.27 18.0914 1585.5 19.9593C1560.51 22.447 1546.37 17.2374 1521.25 16.9595C1488.33 16.5952 1469.26 26.5517 1437 19.9593C1426.66 17.8456 1413.56 25.9727 1403 25.9589C1387.71 25.9391 1389.77 25.1108 1374.5 25.9589C1338.5 27.9588 1302.75 30.3439 1267 29.9587C1231.33 29.5743 1228.66 24.8307 1193 25.9589C1116.19 28.3894 1053.24 18.2697 977 27.9588C949 31.5174 849.748 24.8011 755 25.9589C683.891 26.8279 644.092 18.1813 573 19.9593C517.426 21.3492 478 29.9587 431 29.9587C395.649 29.9587 410.332 26.7988 375 27.9588C344.998 28.9438 300.276 23.6496 270.5 27.4589C249.775 30.1103 237.869 28.9759 217 27.9588C199.341 27.0982 120.109 21.4611 93 19.9593C66.5465 18.4938 75 25.9589 57 25.9589C6.77965 25.9589 0 19.9593 0 19.9593V0Z"
            ></path>
          </svg>
        </div>
      </div>
      <div className="markdown-body max-w px-4 pt-12">
        <p className="font-normal text-md my-1 pb-8 pl-4 pr-8">
          Watched properties can be configured to trigger side effects (eg asynchronous workflow activity).
          <br />
          Consider a question change in the demo below.
          <br />A question will update a temporarily answer, call a remote Answer service, and then update the answer
          after the remote service responds.
        </p>
        <CodeBox
          fileName="question-answer.store.ts"
          style="width: 767px; height: 670px;"
          src="https://carbon.now.sh/embed/wItZQ4oSPMk0GlAIeHhF"
        />
        <p className="font-normal text-md my-1 pt-4 pb-4 pl-4 pr-8"></p>
        <CodeBox
          fileName="demo.tsx"
          style="width: 767px; height: 340px;"
          src="https://carbon.now.sh/embed/5X8CT4ZkQi9qPjn5vd5g"
        />
      </div>
    </div>
  );
};

export default DemoBox;
