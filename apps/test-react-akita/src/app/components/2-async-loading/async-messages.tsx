import React, { useContext, useState } from 'react';

import { EmailService, EmailServiceContext } from '../../services';
import { makeStore, MessagesState } from './async-messages.store';

export const AsyncMessages: React.FC = () => {
  const service = useContext<EmailService>(EmailServiceContext);
  const [useStore] = useState(() => makeStore(service))

  const state: MessagesState = useStore();

  return (
    <div className="sampleBox">
      {state.isLoading &&       
        
        <>
          Loading in <span className="count"> {state.timeToReady} </span> sec!
          <img src="assets/spinner.gif" width="30%"></img>
        </>
        
      }

      {!state.isLoading && 
        <>
          Emails:
          <ul>
            {state.messages.map((msg, i) => (
              <li className="message" key={i}>
                {msg}
              </li>
            ))}
          </ul>
          <button onClick={state.refresh}> Refresh </button>
        </>
      }

    </div>
  );
};
