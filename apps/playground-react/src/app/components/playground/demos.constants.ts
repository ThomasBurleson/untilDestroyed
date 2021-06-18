import SimpleCounter from '../1-simple-counter';
import AsyncMessages from '../2-async-loading';
import FilteredMessages from '../3-computed-property';

import QuestionAnswer from '../4-watch-property';
import SharedState from '../5-shared-state';

export interface NavButton {
  label: string;
  url: string;
  component: React.FC;
}

export const BUTTONS: NavButton[] = [
  { label: 'Simple Counter', url: '/demos/simple-counter', component: SimpleCounter },
  { label: 'Async Loading', url: '/demos/async-loading', component: AsyncMessages },
  { label: 'Computed Properties', url: '/demos/computed-properties', component: FilteredMessages },
  { label: 'Watched Properties', url: '/demos/watched-properties', component: QuestionAnswer },
  { label: 'Shared State', url: '/demos/shared-state', component: SharedState },
];
