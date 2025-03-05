import redis from '../config/redis';

export const acquireLock = async (key: string, ttl: number = 15) => {
  const lockKey = `lock:${key}`;

  // Try setting the lock (NX ensures it's set only if it doesn’t exist)
  const success = await redis.set(lockKey, 'locked', { EX: ttl, NX: true });

  return success === 'OK'; // Returns true if lock acquired, false otherwise
};

export const releaseLock = async (key: string) => {
  const lockKey = `lock:${key}`;
  await redis.del(lockKey);
};
