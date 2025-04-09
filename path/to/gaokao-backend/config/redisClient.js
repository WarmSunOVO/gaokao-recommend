// config/redisClient.js
const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config(); // 加载 .env

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || '127.0.0.1', // 从 .env 读取或用默认值
        port: process.env.REDIS_PORT || 6379,
    },
    // password: process.env.REDIS_PASSWORD,
});

redisClient.on('connect', () => console.log('Redis client connected'));
redisClient.on('error', (err) => console.error('Redis client error:', err));

module.exports = redisClient;
