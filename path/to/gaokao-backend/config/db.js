// config/db.js
const mysql = require('mysql2/promise'); // 使用 promise 版本的 mysql2
const dotenv = require('dotenv');

dotenv.config(); // 加载 .env 文件中的环境变量

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // 连接池最大连接数
  queueLimit: 0
});

// 测试连接 (可选, 但推荐)
pool.getConnection()
  .then(connection => {
    console.log('MySQL Database connected successfully!');
    connection.release(); // 释放连接回连接池
  })
  .catch(err => {
    console.error('Error connecting to MySQL Database:', err);
    // 根据错误类型可能需要退出进程
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.');
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
       console.error('Database access denied for user. Check credentials in .env');
    }
     if (err.code === 'ER_BAD_DB_ERROR') {
       console.error(`Database '${process.env.DB_DATABASE}' does not exist. Please create it.`);
    }
    // 如果连接不上，程序可能无法正常工作，可以考虑退出
    // process.exit(1);
  });


module.exports = pool; // 导出连接池