import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: parseInt(process.env['APP_NAME']!) || 'Nest App',
  env: process.env['NODE_ENV'] || 'development',
  allowOrigins: [],
  swaggerEnabled: true,
}));
