import Redis from 'ioredis';

const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null,
    });

redisClient.on('connect', () => {
  console.log('Connected to Redis successfully!');
});

redisClient.on('error', (error) => {
  console.log('Redis connection error:', error);
});

export default redisClient;
