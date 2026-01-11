import { registerAs } from '@nestjs/config';

export default registerAs('app', async () => ({
  name: process.env['APP_NAME'] ?? 'Nexus Talk API',
  env: process.env['NODE_ENV'] || 'development',
  allowOrigins: process.env['ALLOWED_ORIGIONS']
    ? process.env['ALLOWED_ORIGIONS'].split(',').map((origin) => origin.trim())
    : ['http://localhost:5173'],
  webUrl: process.env['APP_WEB_URL'] ?? 'http://localhost:5173',
  swaggerEnabled:
    (process.env['SWAGGER_ENABLED'] ?? 'true').toLowerCase() !== 'false',
}));
