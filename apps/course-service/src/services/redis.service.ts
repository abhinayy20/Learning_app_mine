import { createClient } from 'redis';
import { config } from '../config';

export const redisClient = createClient({
    url: config.redisUrl,
});

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Redis connection failed:', error);
    }
})();

/**
 * Get cached data
 */
export const getCachedData = async (key: string): Promise<any | null> => {
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
};

/**
 * Set cached data with TTL
 */
export const setCachedData = async (key: string, data: any, ttl: number = 300): Promise<void> => {
    try {
        await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (error) {
        console.error('Redis set error:', error);
    }
};

/**
 * Delete cached data (supports patterns)
 */
export const deleteCachedData = async (pattern: string): Promise<void> => {
    try {
        if (pattern.includes('*')) {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(keys);
            }
        } else {
            await redisClient.del(pattern);
        }
    } catch (error) {
        console.error('Redis delete error:', error);
    }
};
