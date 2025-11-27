export const redisConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      ttl: 60, // 1'
    };
  }

  // LOCALHOST - Redis local or in-memory
  return {
    host: '127.0.0.1',
    port: 6379,
    ttl: 60,
  };
};
