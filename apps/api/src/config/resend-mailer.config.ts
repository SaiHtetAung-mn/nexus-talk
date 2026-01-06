import { registerAs } from '@nestjs/config';

export default registerAs('resendMailer', () => ({
  apiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.MAIL_FROM_EMAIL || '',
  fromName: process.env.MAIL_FROM_NAME || 'Nexus Talk',
}));
