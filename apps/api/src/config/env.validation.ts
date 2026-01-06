import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
  APP_NAME: Joi.string().default('Nexus Talk API'),
  APP_WEB_URL: Joi.string().uri().default('http://localhost:5173'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  JWT_ACCESS_SECRET: Joi.string().min(5).required(),
  JWT_REFRESH_SECRET: Joi.string().min(5).required(),
  JWT_ACCESS_EXPIRES_IN_MINUTE: Joi.number().integer().positive().default(15),
  JWT_REFRESH_EXPIRES_IN_MINUTE: Joi.number()
    .integer()
    .positive()
    .default(60 * 24),
  GOOGLE_OAUTH_CLIENT_ID: Joi.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().optional(),
  SWAGGER_ENABLED: Joi.boolean().default(true),
  MAIL_SERVICE: Joi.string().allow('').optional(),
  MAIL_HOST: Joi.alternatives().conditional('MAIL_SERVICE', {
    is: Joi.string().trim().min(1),
    then: Joi.string().allow('').optional(),
    otherwise: Joi.string().required(),
  }),
  MAIL_PORT: Joi.number().integer().positive().default(587),
  MAIL_SECURE: Joi.boolean().default(false),
  MAIL_USERNAME: Joi.string().allow('').optional(),
  MAIL_PASSWORD: Joi.string().allow('').optional(),
  MAIL_FROM_EMAIL: Joi.string().email().required(),
  MAIL_FROM_NAME: Joi.string().default('Nexus Talk'),
}).unknown(true);
