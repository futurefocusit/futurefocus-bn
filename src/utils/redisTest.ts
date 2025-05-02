import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis(process.env.REDIS_URI as string);

export async function testRedisConnection() {
    try {
        await redis.set('test', 'Redis connection successful');
        const value = await redis.get('test');
        console.log('Redis connection test:', value);
        return true;
    } catch (error) {
        console.error('Redis connection error:', error);
        return false;
    }
}

// Run the test
testRedisConnection().then(success => {
    if (success) {
        console.log('Redis connection is working properly');
    } else {
        console.log('Redis connection failed');
    }
    process.exit();
}); 