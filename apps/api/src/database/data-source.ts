import 'dotenv/config';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: process.env['DATABASE_URL'],
  logging: process.env['NODE_ENV'] !== 'production',
  synchronize: false,
  entities: [resolve(__dirname, './entities/*.{ts,js}')],
  migrations: [resolve(__dirname, './migrations/*.{ts,js}')],
});

export default AppDataSource;
