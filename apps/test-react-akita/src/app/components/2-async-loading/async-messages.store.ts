import { createStore, State, UseStore } from '@mindspace-io/react-akita';
import { EmailService } from '../../services';

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

export const makeStore = (emailService: EmailService): UseStore<MessagesState> => {
  const useStore = createStore<MessagesState>(({set, setIsLoading, applyTransaction }) => {
    
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

      applyTransaction(() => {
        setIsLoading();
        set(s => { s.messages = [] });  
      });
      
      const stopCountdown = startCountdown();
      const messages = await emailService.loadAll();

      applyTransaction(() =>{
        set(s => {
          s.messages = messages;
          s.isLoading = false;
          s.timeToReady = 3;
        })       
        stopCountdown();
      });
    };

    // Return state
    return ({
      messages   : [],
      timeToReady: 3,
      refresh
    });
  });

  return useStore;
}


