import * as process from 'process';

export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
}

export const envConfig = (): EnvConfig => {
  const { NODE_ENV = 'development', PORT = '3000', DATABASE_URL } = process.env;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
  }

  return {
    NODE_ENV: NODE_ENV as EnvConfig['NODE_ENV'],
    PORT: parseInt(PORT, 10),
    DATABASE_URL,
  };
};