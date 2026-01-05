import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env['APP_NAME'] ?? 'Nexus Talk API',
  env: process.env['NODE_ENV'] || 'development',
  allowOrigins: [],
  swaggerEnabled:
    (process.env['SWAGGER_ENABLED'] ?? 'true').toLowerCase() !== 'false',
}));
