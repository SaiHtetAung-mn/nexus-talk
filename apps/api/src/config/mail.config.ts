import { registerAs } from '@nestjs/config';

const parseBoolean = (value?: string | number | boolean | null): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  if (!value) {
    return false;
  }
  const normalized = String(value).toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
};

export default registerAs('mail', () => ({
  service: process.env.MAIL_SERVICE ?? '',
  host: process.env.MAIL_HOST ?? '',
  port: Number(process.env.MAIL_PORT ?? 587),
  secure: parseBoolean(process.env.MAIL_SECURE),
  username: process.env.MAIL_USERNAME ?? '',
  password: process.env.MAIL_PASSWORD ?? '',
  fromEmail: process.env.MAIL_FROM_EMAIL ?? '',
  fromName: process.env.MAIL_FROM_NAME ?? 'Nexus Talk',
}));
