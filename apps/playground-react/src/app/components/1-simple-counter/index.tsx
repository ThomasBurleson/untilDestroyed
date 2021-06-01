import { CodeBox } from '../_ui/code-box';
import { SimpleCounter } from './demo';

// ************************************
//  (1) Main approach:
//
// ************************************

const Demo: React.FC = () => {
  return (
    <div>
      <div className="sampleBox bg-gray-200 mb-4">
        <section className="flex items-center justify-center">
          <SimpleCounter />
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
      <div className="markdown-body description max-w px-4 pt-12">
        <p className="font-normal text-md my-1 pb-8 pl-4 pr-8">
          This reactive store is deliberately simple. Developers can see how state (<i>aka</i> data) and mutators (
          <i>aka</i> setter functions) can be easily constructed and used... with a custom hook pre-connected to the
          custom store.
        </p>
        <CodeBox
          fileName="counter.store.ts"
          style="height: 458px;"
          src="https://carbon.now.sh/embed?bg=rgba%28249%2C250%2C251%2C0%29&t=one-dark&wt=none&l=application%2Ftypescript&ds=true&dsyoff=6px&dsblur=8px&wc=true&wa=true&pv=0px&ph=0px&ln=true&fl=1&fm=Hack&fs=13.5px&lh=133%25&si=false&es=2x&wm=false&code=import%2520%257B%2520createStore%2520%257D%2520from%2520%27%2540mindspace-io%252Freact%27%253B%250Aimport%2520type%2520%257B%2520CounterState%2520%257D%2520from%2520%27.%252Fcounter.interfaces%27%253B%250A%250Aexport%2520const%2520useCounter%2520%253D%2520createStore%253CCounterState%253E%28%28%257B%2520set%2520%257D%29%2520%253D%253E%2520%28%257B%250A%2520%2520count%253A%25202%252C%250A%2520%2520incrementCount%28%29%2520%257B%250A%2520%2520%2520%2520set%28%28s%29%2520%253D%253E%2520%257B%2520%2520s.count%2520%252B%253D%25201%253B%2520%257D%29%253B%250A%2520%2520%257D%252C%250A%2520%2520decrementCount%28%29%2520%257B%250A%2520%2520%2520%2520set%28%28s%29%2520%253D%253E%2520%257B%2520%2520s.count%2520-%253D%25201%253B%2520%257D%29%253B%250A%2520%2520%257D%252C%250A%257D%29%29%253B%250A%250A%250A%250A%250A%250A%250A%250A%250A%250A"
        />
        <CodeBox
          fileName="counter.tsx"
          style="height: 458px;"
          src="https://carbon.now.sh/embed?bg=rgba%28249%2C250%2C251%2C0%29&t=one-dark&wt=none&l=application%2Ftypescript&ds=true&dsyoff=6px&dsblur=8px&wc=true&wa=true&pv=0px&ph=0px&ln=true&fl=1&fm=Hack&fs=13.5px&lh=133%25&si=false&es=2x&wm=false&code=import%2520%257B%2520useCounter%2520%257D%2520from%2520%27.%252Fcounter.store%27%253B%250A%250Aexport%2520const%2520SimpleCounter%253A%2520React.FC%2520%253D%2520%28%29%2520%253D%253E%2520%257B%250A%2520%2520const%2520%257B%2520%2520%250A%2520%2520%2520%2520count%252C%2520%250A%2520%2520%2520%2520incrementCount%252C%2520%250A%2520%2520%2520%2520decrementCount%2520%2520%250A%2520%2520%257D%2520%253D%2520useCounter%253CCounterState%253E%28%29%253B%250A%250A%2520%2520return%2520%28%250A%2520%2520%2520%2520%253Cdiv%253E%250A%2520%2520%2520%2520%2520%2520%253Ch3%253E%2520Total%2520Votes%2520%257Bcount%257D%2520%253C%252Fh3%253E%250A%2520%2520%2520%2520%2520%2520%253Cp%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520Before%2520you%2520can%2520work%2520remote%252C%2520you%2520need%2520a%2520minimum%2520of%25203%2520%27yes%27%2520votes.%250A%2520%2520%2520%2520%2520%2520%253C%252Fp%253E%250A%2520%2520%2520%2520%2520%2520%253Cdiv%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520%253Cbutton%2520onClick%253D%257BincrementCount%257D%253E%2520%25E2%2596%25B2%2520Vote%2520Yes%2520%253C%252Fbutton%253E%250A%2520%2520%2520%2520%2520%2520%2520%2520%253Cbutton%2520onClick%253D%257BdecrementCount%257D%253E%2520%25E2%2596%25BC%2520Vote%2520No%2520%2520%253C%252Fbutton%253E%250A%2520%2520%2520%2520%2520%2520%253C%252Fdiv%253E%250A%2520%2520%2520%2520%253C%252Fdiv%253E%250A%2520%2520%29%253B%250A%257D%253B"
        />
        <p className="font-normal text-md my-1 pt-4 pl-4 pr-8">
          By default, the reactive store will <u>preserve data</u> (<i>aka</i> 'state') between routing to other
          components.
          <br />
          For this demo, that means that the vote count is preserved/restored after component unmounting and mounting
          (respectively).
        </p>
      </div>
    </div>
  );
};

export default Demo;
