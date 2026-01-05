import 'dotenv/config';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'mongodb',
  url: process.env['DATABASE_URL'],
  logging: process.env['NODE_ENV'] !== 'production',
  synchronize: false,
  migrations: [],
});

export default AppDataSource;
