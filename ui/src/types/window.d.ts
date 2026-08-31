
import type InactivityTracker from '../utils/inactivityTracker';

 

declare global {

  interface Window {

    inactivityTracker?: InactivityTracker;

  }

}

 

export {};