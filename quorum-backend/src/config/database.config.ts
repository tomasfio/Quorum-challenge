import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
  logQueries: boolean;
}

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    url: process.env.DATABASE_URL!,
    logQueries: process.env.NODE_ENV !== 'production',
  }),
);
