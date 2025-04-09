// routes/favorites.js
const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

// --- Existing GET /:type and POST /toggle routes remain the same ---

// GET /api/favorites/:type - 获取用户指定类型的收藏列表ID (保持不变)
router.get('/:type', authenticateToken, async (req, res) => {
    // ... (之前的代码) ...
    const userId = req.user.userId;
    const itemType = req.params.type;
    if (!['university', 'major'].includes(itemType)) { return res.status(400).json({ code: 400, message: '无效的收藏类型' }); }
    try {
        const [favorites] = await db.query('SELECT item_id FROM user_favorites WHERE user_id = ? AND item_type = ?', [userId, itemType]);
        const favoriteIds = favorites.map(fav => fav.item_id);
        res.status(200).json({ code: 200, data: favoriteIds });
    } catch (error) { console.error(`获取收藏列表 (${itemType}) 失败:`, error); res.status(500).json({ code: 500, message: '获取收藏列表失败' }); }
});

// POST /api/favorites/toggle - 添加/取消收藏 (保持不变)
router.post('/toggle', authenticateToken, async (req, res) => {
    // ... (之前的代码) ...
    const userId = req.user.userId;
    const { itemId, itemType } = req.body;
    if (!itemId || !itemType || !['university', 'major'].includes(itemType)) { return res.status(400).json({ code: 400, message: '参数无效' }); }
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [existing] = await connection.query('SELECT id FROM user_favorites WHERE user_id = ? AND item_id = ? AND item_type = ?', [userId, itemId, itemType]);
        let isFavoritedNow = false;
        if (existing.length > 0) {
            await connection.query('DELETE FROM user_favorites WHERE id = ?', [existing[0].id]); isFavoritedNow = false;
        } else {
            await connection.query('INSERT INTO user_favorites (user_id, item_id, item_type) VALUES (?, ?, ?)', [userId, itemId, itemType]); isFavoritedNow = true;
        }
        await connection.commit();
        res.status(200).json({ code: 200, message: '操作成功', data: { isFavorited: isFavoritedNow } });
    } catch (error) { await connection.rollback(); console.error('切换收藏状态失败:', error); res.status(500).json({ code: 500, message: '操作失败，请稍后重试' }); } finally { connection.release(); }
});


// --- 新增：获取收藏详情的 API ---

// GET /api/favorites/details/university - 获取收藏的大学详情
router.get('/details/university', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        // 1. 查找用户收藏的 university IDs
        const [favIdsResult] = await db.query(
            'SELECT item_id FROM user_favorites WHERE user_id = ? AND item_type = ?',
            [userId, 'university']
        );
        const favoriteIds = favIdsResult.map(fav => fav.item_id);

        if (favoriteIds.length === 0) {
            return res.status(200).json({ code: 200, data: [] }); // 没有收藏，返回空数组
        }

        // 2. 根据 IDs 查询 universities 表获取详细信息
        //    确保查询了前端需要的字段 (包括模拟需要的 logo_url, level, type, website_url)
        const [universities] = await db.query(`
        SELECT id, name, tags, province
        FROM universities
        WHERE id IN (?)
        ORDER BY name ASC
    `, [favoriteIds]);

         // 模拟数据 (如果数据库缺少字段)
         const universitiesWithMock = universities.map((uni, index) => ({
             ...uni,
             logo_url: uni.logo_url || `/images/mock-logo-${index % 4}.png`,
             level: uni.level || (index % 3 === 0 ? '普通本科' : '专科 (高职)'),
             type: uni.type || (index % 2 === 0 ? '综合类' : '理工类'),
             website_url: uni.website_url || `https://example.com/uni/${uni.id}`
         }));

        res.status(200).json({ code: 200, data: universitiesWithMock });

    } catch (error) {
        console.error('获取收藏的大学详情失败:', error);
        res.status(500).json({ code: 500, message: '获取收藏的大学详情失败' });
    }
});

// GET /api/favorites/details/major - 获取收藏的专业详情
router.get('/details/major', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        // 1. 查找用户收藏的 major IDs
        const [favIdsResult] = await db.query(
            'SELECT item_id FROM user_favorites WHERE user_id = ? AND item_type = ?',
            [userId, 'major']
        );
        const favoriteIds = favIdsResult.map(fav => fav.item_id);

        if (favoriteIds.length === 0) {
            return res.status(200).json({ code: 200, data: [] }); // 没有收藏，返回空数组
        }

        // 2. 根据 IDs 查询 majors 表，并 JOIN universities 表获取大学名称
        //    确保查询了前端需要的字段 (包括模拟需要的 category_name, code, duration, degree)
        const [majors] = await db.query(`
        SELECT
            m.id, m.university_id, m.name,
            m.plan_count, m.admission_rank_min, /* 查询实际存在的字段 */
            u.name AS university_name
        FROM majors m
        LEFT JOIN universities u ON m.university_id = u.id
        WHERE m.id IN (?)
        ORDER BY u.name ASC, m.name ASC
    `, [favoriteIds]);

        // 模拟数据 (如果数据库缺少字段)
        const majorsWithMock = majors.map((major, index) => ({
             ...major,
             category_name: major.category_name || (index < 5 ? '哲学类' : (index < 8 ? '经济学' : '法学类')),
             code: major.code || `0${((index % 8) + 1)}010${index + 1}`,
             duration: major.duration || '四年',
             degree: major.degree || (major.category_name === '哲学类' ? '哲学学士' : '相应学士'),
             university_name: major.university_name || '未知大学' // 如果 JOIN 失败或大学表中无此记录
         }));


        res.status(200).json({ code: 200, data: majorsWithMock });

    } catch (error) {
        console.error('获取收藏的专业详情失败:', error);
        res.status(500).json({ code: 500, message: '获取收藏的专业详情失败' });
    }
});


module.exports = router;