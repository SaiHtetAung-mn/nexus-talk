import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
  googleOAuthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  accessJwtSecret: process.env.JWT_ACCESS_SECRET,
  accessJwtExpiresInMinute:
    Number(process.env.JWT_ACCESS_EXPIRES_IN_MINUTE) || 15,
  refreshJwtSecret: process.env.JWT_REFRESH_SECRET,
  refreshJwtExpiresInMinute:
    Number(process.env.JWT_REFRESH_EXPIRES_IN_MINUTE) || 60 * 24,
}));
