import { createContext } from 'react';
import { EmailService } from './email.service';

export const EmailServiceContext = createContext<EmailService>(null);
