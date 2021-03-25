const EMAILS = [
  'Adding Syntax Highlighting to MDX with Prism',
  'Call ASAP: You have inherited $1M Dollars',
  'Conversation Skills: Have a Great Conversation',
  'The IRS has claimed your assets. Fix this now!',
];

export class EmailService {
  constructor(private delay = 3000) {}

  loadAll(): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(EMAILS);
      }, this.delay);
    });
  }
}
