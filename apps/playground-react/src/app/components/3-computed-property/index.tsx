import React from 'react';

import { CodeBox } from '../_ui/code-box';
import { FilteredMessages } from './demo';

// ************************************
//  (1) Main approach:
//
// ************************************

const DemoBox: React.FC = () => {
  return (
    <div>
      <div className="sampleBox bg-gray-200 mb-4">
        <section className="flex items-center justify-center">
          <FilteredMessages />
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
          Computed properties can be defined to dynamically generate data when target properties change.
          <br />
          Here the <span className="highlight">'Filter by:'</span> input value is used to both filter the list of
          messages and highlight the matching search strings.
        </p>
        <CodeBox
          fileName="messages.store.ts"
          style="width: 767px; height: 424px;"
          src="https://carbon.now.sh/embed?bg=rgba%28249%2C250%2C251%2C0%29&t=one-dark&wt=none&l=application%2Ftypescript&ds=true&dsyoff=6px&dsblur=8px&wc=true&wa=true&pv=0px&ph=0px&ln=true&fl=1&fm=Hack&fs=13.5px&lh=133%25&si=false&es=2x&wm=false&code=export%2520const%2520useMessageStore%2520%253D%2520createStore%253CMessagesState%253E%28%250A%2520%2520%28%257B%2520set%252C%2520addComputedProperty%2520%257D%29%2520%253D%253E%2520%257B%250A%2520%2520%2520%2520%250A%2520%2520%2520%2520const%2520store%2520%253D%2520%257B%250A%2520%2520%2520%2520%2520%2520filterBy%2520%253A%2520%27%27%252C%250A%2520%2520%2520%2520%2520%2520messages%2520%253A%2520MESSAGES%252C%250A%2520%2520%2520%2520%2520%2520updateFilter%28filterBy%253A%2520string%29%2520%257B%250A%2520%2520%2520%2520%2520%2520%2520%2520set%28%28s%29%2520%253D%253E%2520%257B%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520s.filterBy%2520%253D%2520filterBy%253B%250A%2520%2520%2520%2520%2520%2520%2520%2520%257D%29%253B%250A%2520%2520%2520%2520%2520%2520%257D%252C%250A%2520%2520%2520%2520%2520%2520filteredMessages%253A%2520%255B%255D%252C%2509%2509%252F%252F%2520initial%2520value%2520of%2520computed%2520property%250A%2520%2520%2520%2520%257D%253B%250A%250A%2520%2520%2520%2520return%2520addComputedProperty%28store%252C%2520%257B%250A%2520%2520%2520%2520%2520%2520name%2520%2520%2520%2520%2520%253A%2520%27filteredMessages%27%252C%250A%2520%2520%2520%2520%2520%2520selectors%253A%2520%255B%28s%253A%2520MessagesState%29%2520%253D%253E%2520s.messages%252C%2520%28s%253A%2520MessagesState%29%2520%253D%253E%2520s.filterBy%255D%252C%250A%2520%2520%2520%2520%2520%2520transform%253A%2520onlyFilteredMessages%252C%250A%2520%2520%2520%2520%257D%29%253B%250A%2520%2520%257D%250A%29%253B%250A"
        />
        <p className="font-normal text-md my-1 pt-4 pb-4 pl-4 pr-8"></p>
        <CodeBox
          fileName="demo.tsx"
          style="width: 767px; height: 460px;"
          src="https://carbon.now.sh/embed?bg=rgba%28249%2C250%2C251%2C0%29&t=one-dark&wt=none&l=application%2Ftypescript&ds=true&dsyoff=6px&dsblur=8px&wc=true&wa=true&pv=0px&ph=0px&ln=true&fl=1&fm=Hack&fs=13.5px&lh=133%25&si=false&es=2x&wm=false&code=export%2520const%2520FilteredMessages%253A%2520React.FC%2520%253D%2520%28%29%2520%253D%253E%2520%257B%250A%2520%2520const%2520%255B%250A%2520%2520%2520%2520searchCriteria%252C%2520%250A%2520%2520%2520%2520messages%252C%2520%250A%2520%2520%2520%2520updateSearchBy%250A%2520%2520%255D%2520%253D%2520useMessageStore%28selectMessageVM%29%253B%250A%250A%2520%2520return%2520%28%250A%2520%2520%2520%2520%253Cdiv%253E%250A%2520%2520%2520%2520%2520%2520%253Cdiv%2520className%253D%2522filterBy%2522%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520%253Clabel%2520htmlFor%253D%2522filterBy%2522%253E%2520Filter%2520by%253A%2520%253C%252Flabel%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520%253Cinput%2520type%253D%2522text%2522%2520%250A%2520%2520%2520%2520%2520%2520%2520%2509%2509%2520%2520%2520value%253D%257BsearchCriteria%257D%2520%250A%2509%2509%2509%2520%2520%2520onChange%253D%257B%28e%29%2520%253D%253E%2520updateSearchBy%28e.target.value%29%257D%2520%252F%253E%250A%2520%2520%2520%2520%2520%2520%253C%252Fdiv%253E%250A%2520%2520%2520%2520%2520%2520%253Cul%2520className%253D%2522%2522%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520%257Bmessages.map%28%28msg%252C%2520i%29%2520%253D%253E%2520%28%250A%2520%2520%2520%2520%2520%2520%2520%2520%2520%2520%253Cli%2520className%253D%2522message%2522%2520key%253D%257Bi%257D%2520dangerouslySetInnerHTML%253D%257B%257B%2520__html%253A%2520msg%2520%257D%257D%2520%252F%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520%29%29%257D%250A%2520%2520%2520%2520%2520%2520%253C%252Ful%253E%250A%2520%2520%2520%2520%253C%252Fdiv%253E%250A%2520%2520%29%253B%250A%257D%253B%250A"
        />
      </div>
    </div>
  );
};

export default DemoBox;
