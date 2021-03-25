import React, { useState } from 'react';

import { EmailService } from './email.service';
import { EmailServiceContext } from './email-service.context';

export const EmailServiceProvider: React.FC = ({ children }) => {
  const [service] = useState<EmailService>(() => new EmailService());

  return <EmailServiceContext.Provider value={service}>{children}</EmailServiceContext.Provider>;
};
