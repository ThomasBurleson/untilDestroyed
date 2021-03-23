import { createStore, State } from '@mindspace-io/react-akita';

const EMAILS = [
  'Adding Syntax Highlighting to MDX with Prism',
  'Call ASAP: You have inherited $1M Dollars',
  'Conversation Skills: Have a Great Conversation',
  'The IRS has claimed your assets. Fix this now!',
];

class EmailService {
  constructor(private delay = 3000) {}

  loadAll(): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(EMAILS);
      }, this.delay);
    });
  }
}

/**********************************************
 *  Purpose:
 * 
 *  Demonstrate the use of async mutators
 * 
 **********************************************/

/*******************************************
 * Define the state + mutators
 *******************************************/

export interface MessagesState extends State {
  timeToReady: number;
  messages: string[];

  // Mutators
  refresh: () => void; 
}

/*******************************************
 * Instantiate store with state
 *******************************************/


export const useStore = createStore<MessagesState>(({set, setIsLoading }) => {
  const service = new EmailService();
  const startCountdown = () => {
    const countDown = setInterval(() => {
      set(s => { s.timeToReady -= 1})
    },1000);
    return () => clearInterval(countDown);
  };
  /**
   * refresh()
   * 
   * 1) async loads messages, 
   * 2) updates loading indicator
   * 3) updates countdown timer
   */
  const refresh = async () => {
    setIsLoading();
    set(s => { s.messages = [] });  
    
    const stopCountdown = startCountdown();
    const messages = await service.loadAll();

    set(s => {
      s.messages = messages;
      s.isLoading = false;
      s.timeToReady = 3;
    })       
    stopCountdown();
  };

  // Return state
  return ({
    messages   : [],
    timeToReady: 3,
    refresh
  });
});


