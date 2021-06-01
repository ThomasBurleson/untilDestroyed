export const MESSAGES = [
  'Can you pickup some organic food on the way home?',
  'The veterinarian called. X-rays showed your dog is fine.',
  'Obesity is a pandemic in the USA',
  'Spotify is an amazing music service',
];

/**
 * Build computed property for `filteredMessages`
 * Uses an array of selectors [<all messages>, <filterBy criteria>]
 * for optimized change propagation
 */

export const onlyFilteredMessages = ([messages, filterBy]: [string[], string]): string[] => {
  const criteria = filterBy.toLowerCase();
  const containsFilterValue = (s: string) => s.toLowerCase().indexOf(criteria) > -1;
  const addMarkers = (s: string) =>
    s.replace(new RegExp(filterBy, 'gi'), (match) => `<span class='match'>${match}</span>`);

  return filterBy ? messages.filter(containsFilterValue).map(addMarkers) : [...messages];
};
