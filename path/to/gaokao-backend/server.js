// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const recommendRoutes = require('./routes/recommend');
const dataQueryRoutes = require('./routes/dataQuery'); 
const favoritesRoutes = require('./routes/favorites'); 
const redisClient = require('./config/redisClient');

dotenv.config();
const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('GaoKao Helper Backend is running!');
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/data', dataQueryRoutes);       // <--- 使用
app.use('/api/favorites', favoritesRoutes);   // <--- 使用

// 启动服务器 (确保 Redis 连接成功)
redisClient.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`Server instance running on http://localhost:${PORT}`);
    });
}).catch(err => {
     console.error('Failed to connect to Redis:', err);
     process.exit(1);
});