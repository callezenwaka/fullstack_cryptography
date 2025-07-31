import { Pool } from 'pg';
import { DatabaseConfig } from '../types';

const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'crypto_app',
  user: process.env.DB_USER || 'crypto_user',
  password: process.env.DB_PASSWORD || 'crypto_password',
};

export const pool = new Pool(config);

export const connectDB = async (): Promise<void> => {
  try {
    await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;