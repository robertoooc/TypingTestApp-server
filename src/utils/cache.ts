import { createClient, RedisClientType } from 'redis';

const client: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('connect', () => {
  console.log('Connected to Redis');
  
});

client.on('error', err => {
  console.error('Redis error: ', err);
});

client.connect();

const setCache = async (key: string, value: any, expiry: number = 600): Promise<void> => {
  try {
    await client.set(key, JSON.stringify(value), {
      EX: expiry
    });
  } catch (err) {
    console.error('Error setting cache: ', err);
  }
};

const getCache = async (key: string): Promise<any | null> => {
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Error getting cache: ', err);
    return null;
  }
};

const deleteCache = async (key: string): Promise<void> => {
  try {
    await client.del(key);
  } catch (err) {
    console.error('Error deleting cache: ', err);
  }
};

export { setCache, getCache, deleteCache };
