import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/courses',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    cacheTTL: parseInt(process.env.CACHE_TTL || '300', 10),
};
