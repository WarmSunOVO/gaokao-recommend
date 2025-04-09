// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // 从 Authorization Header 获取 token (格式: Bearer TOKEN)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // 如果没有 token，根据接口要求决定是否允许访问
        // 对于收藏功能，必须有 token
        return res.status(401).json({ code: 401, message: '未授权访问，请先登录' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token 验证失败:', err.message);
            // Token 过期或无效
            return res.status(403).json({ code: 403, message: '访问令牌无效或已过期' });
        }
        // 将解码后的用户信息 (payload) 附加到请求对象上
        req.user = user;
        console.log('Token验证通过, User:', req.user); // 打印解码后的用户信息
        next(); // 继续处理请求
    });
}

module.exports = authenticateToken;
