import 'dotenv/config';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  port:          Number(process.env.PORT ?? 4000),
  nodeEnv:       process.env.NODE_ENV ?? 'development',
  databaseUrl:   required('DATABASE_URL'),
  jwtSecret:     required('JWT_SECRET'),
  jwtExpiresIn:  process.env.JWT_EXPIRES_IN ?? '7d',
  clientOrigin:  process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
} as const;
