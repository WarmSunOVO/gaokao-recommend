// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // 引入数据库连接池

const router = express.Router();
const saltRounds = 10; // bcrypt 哈希计算工作量

// --- 注册接口 ---
router.post('/register', async (req, res) => {
  const { account, phone, password, name, gender, idCard } = req.body;

  // 1. 基本验证
  if (!account || !phone || !password) {
    return res.status(400).json({ code: 400, message: '账号、手机号和密码不能为空' });
  }
  // 可以添加更复杂的验证，如密码强度、手机号格式等

  try {
    // 2. 检查账号或手机号是否已存在
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE account = ? OR phone = ?',
      [account, phone]
    );

    if (existingUsers.length > 0) {
      // 判断是账号冲突还是手机号冲突 (可选)
      const existing = await db.query('SELECT account, phone FROM users WHERE account = ? OR phone = ?', [account, phone]);
      let conflictMsg = '注册失败';
      if (existing[0][0].account === account) {
          conflictMsg = '该账号已被注册';
      } else if (existing[0][0].phone === phone) {
          conflictMsg = '该手机号已被注册';
      }
      return res.status(409).json({ code: 409, message: conflictMsg }); // 409 Conflict
    }

    // 3. 哈希密码
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. 插入新用户到数据库
    const [result] = await db.query(
      'INSERT INTO users (account, phone, password, name, gender, id_card) VALUES (?, ?, ?, ?, ?, ?)',
      [account, phone, hashedPassword, name || null, gender || null, idCard || null]
    );

    console.log('用户注册成功, ID:', result.insertId);
    res.status(200).json({ code: 200, message: '注册成功' });

  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误，注册失败' });
  }
});

// --- 登录接口 ---
router.post('/login', async (req, res) => {
  const { account, password } = req.body; // 用户可以用账号或手机号登录

  if (!account || !password) {
    return res.status(400).json({ code: 400, message: '账号和密码不能为空' });
  }

  try {
    // 1. 根据账号或手机号查找用户
    const [users] = await db.query(
      'SELECT id, account, phone, password, name, avatar_url, gender, id_card FROM users WHERE account = ? OR phone = ?',
      [account, account] // 同时用 account 字段查询 account 或 phone
    );

    if (users.length === 0) {
      return res.status(401).json({ code: 401, message: '账号或密码错误' }); // 401 Unauthorized
    }

    const user = users[0];

    // 2. 比较密码
    const isMatch = await bcrypt.compare(password, user.password); // 将用户输入的明文密码与数据库存储的哈希比较

    if (!isMatch) {
      return res.status(401).json({ code: 401, message: '账号或密码错误' });
    }

    // 3. 密码匹配，生成 JWT Token
    const payload = {
      userId: user.id,
      account: user.account // 可以在 payload 中包含一些非敏感信息
    };
    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token 有效期，例如 7 天
    );

    // 4. 准备返回给前端的用户信息 (!!绝不能包含密码!!)
    const userInfo = {
      id: user.id,
      account: user.account,
      phone: user.phone,
      name: user.name,
      gender: user.gender,
      idCard: user.id_card, // 如果需要返回，考虑脱敏
      avatarUrl: user.avatar_url // 假设有头像字段
      // 根据需要添加更多字段
    };

    console.log(`用户 ${user.account} 登录成功`);
    res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        token: token,
        userInfo: userInfo
      }
    });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误，登录失败' });
  }
});


module.exports = router;