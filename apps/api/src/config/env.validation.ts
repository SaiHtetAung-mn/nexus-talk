import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),
  JWT_ACCESS_SECRET: Joi.string().min(5).required(),
  JWT_REFRESH_SECRET: Joi.string().min(5).required(),
}).unknown(true);
