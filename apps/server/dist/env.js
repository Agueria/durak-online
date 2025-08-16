import { z } from 'zod';
const envSchema = z.object({
    PORT: z.string().default('3001').transform(Number),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
    REDIS_URL: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});
export const env = envSchema.parse(process.env);
