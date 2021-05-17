import { renderHook, act } from '@testing-library/react-hooks/dom';
import { UseStore } from '@mindspace-io/react';

import { MessagesState } from './messages.interfaces';
import { useMessageStore } from './messages.store';

describe('MessageStore', () => {
  it('filters messages asynchronously', async () => {
    const { result, waitForNextUpdate } = renderHook<UseStore<MessagesState>, MessagesState>(useMessageStore);

    // Wait for next hook render, since ComputedProperties are always updated asynchronously
    await waitForNextUpdate();

    expect(result.current.filterBy).toBe('');
    expect(result.current.messages.length).toBe(4);
    expect(result.current.filteredMessages.length).toBe(4);

    act(() => {
      result.current.updateFilter('Obesity');
    });

    // Wait for next hook render, since ComputedProperties are always updated asynchronously
    await waitForNextUpdate();

    expect(result.current.messages.length).toBe(4);
    expect(result.current.filteredMessages.length).toBe(1);
  });
});
