import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379', // Ensure REDIS_URL includes TLS
  socket: {
    tls: process.env.NODE_ENV === 'production', // Enable TLS for encrypted connection must for elastic cache aws
  },
});

redis.on('error', (err) => console.error('Redis Error:', err));

(async () => {
  await redis.connect();
  console.log('Connected to Redis');
})();

export default redis;
