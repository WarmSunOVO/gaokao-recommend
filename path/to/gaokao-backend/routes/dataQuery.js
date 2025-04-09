// routes/dataQuery.js
const express = require('express');
const db = require('../config/db'); // Ensure this points to your database connection pool
const router = express.Router();

// --- University Routes ---

// GET /api/data/universities - 获取大学列表
router.get('/universities', async (req, res) => {
    try {
        // SQL: Select only core fields assumed to exist
        const [universities] = await db.query(`
            SELECT id, name, tags, province
            FROM universities
            ORDER BY name ASC
        `);

        // Mocking logic for optional frontend fields
        const universitiesWithMock = universities.map((uni, index) => ({
            ...uni, // Spread existing fields from DB
            // Provide defaults if these fields aren't returned from DB
            logo_url: uni.logo_url || `/images/mock-logo-${index % 4}.png`,
            level: uni.level || (index % 3 === 0 ? '普通本科' : '专科 (高职)'),
            type: uni.type || (index % 2 === 0 ? '综合类' : '理工类'),
            website_url: uni.website_url || `https://example.com/uni/${uni.id}`
        }));

        res.status(200).json({ code: 200, data: universitiesWithMock });

    } catch (error) {
        console.error('获取大学列表失败:', error);
        res.status(500).json({ code: 500, message: '服务器错误：获取大学列表失败' });
    }
});

// --- Major Routes ---

// GET /api/data/majors/grouped - 获取分组后的专业列表
router.get('/majors/grouped', async (req, res) => {
    try {
        // SQL: Select only core fields assumed to exist
        const [majors] = await db.query(`
            SELECT id, university_id, name, plan_count, admission_rank_min
            FROM majors
            ORDER BY name ASC /* Order by name */
        `);

        // Mocking logic for optional frontend fields
        const majorsWithMock = majors.map((major, index) => ({
            ...major, // Spread existing fields from DB
            // Provide defaults if these fields aren't returned from DB
            category_name: major.category_name || (index < 5 ? '哲学类' : (index < 10 ? '经济学' : '法学类')),
            code: major.code || `0${((index % 9) + 1)}010${index + 1}`,
            duration: major.duration || '四年',
            degree: major.degree || '学士'
        }));

        // Grouping logic using potentially mocked category_name
        const groupedMajors = majorsWithMock.reduce((acc, major) => {
            const category = major.category_name || '未分类';
            if (!acc[category]) {
                acc[category] = { categoryName: category, majors: [] };
            }
            acc[category].majors.push({
                id: major.id,
                name: major.name,
                code: major.code,       // Potentially mocked
                duration: major.duration, // Potentially mocked
                degree: major.degree     // Potentially mocked
            });
            return acc;
        }, {});

        res.status(200).json({ code: 200, data: Object.values(groupedMajors) });

    } catch (error) {
        console.error('获取专业列表失败:', error);
        res.status(500).json({ code: 500, message: '服务器错误：获取专业列表失败' });
    }
});

// --- Control Line Route ---

// GET /api/data/control-lines - 获取省控线数据
router.get('/control-lines', async (req, res) => {
    const { province, year } = req.query;

    if (!province || !year || isNaN(parseInt(year))) { // Validate input
        return res.status(400).json({ code: 400, message: '缺少有效的省份或年份参数' });
    }

    try {
        // SQL: Assumes these columns exist in control_lines table
        const [lines] = await db.query(
            'SELECT province, year, category, batch, score FROM control_lines WHERE province = ? AND year = ? ORDER BY score DESC',
            [province, parseInt(year)]
        );
        res.status(200).json({ code: 200, data: lines });
    } catch (error) {
        console.error('获取省控线失败:', error);
        res.status(500).json({ code: 500, message: '服务器错误：获取省控线失败' });
    }
});

// --- Admission Plan Route ---

// GET /api/data/admission-plans - 获取招生计划数据 (支持搜索和分页)
router.get('/admission-plans', async (req, res) => {
    const { keyword } = req.query;
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 15; // Default to 15 items per page
    const offset = (page - 1) * limit;

    if (page <= 0 || limit <= 0) {
         return res.status(400).json({ code: 400, message: '分页参数无效' });
    }


    try {
        let whereClause = 'WHERE 1=1';
        const queryParams = [];

        if (keyword) {
            whereClause += ' AND (u.name LIKE ? OR p.major_name LIKE ?)';
            const searchTerm = `%${keyword}%`;
            queryParams.push(searchTerm, searchTerm);
        }

        // Query total count
        const countSql = `
            SELECT COUNT(p.id) as total
            FROM admission_plans p
            LEFT JOIN universities u ON p.university_id = u.id
            ${whereClause}
        `;
        const [totalResult] = await db.query(countSql, queryParams);
        const total = totalResult[0].total;

        // Query paginated data
        const dataSql = `
            SELECT
                p.id, p.university_id, p.major_name, p.year, p.batch, p.category, p.plan_count, p.subject_group,
                u.name AS university_name
            FROM admission_plans p
            LEFT JOIN universities u ON p.university_id = u.id
            ${whereClause}
            ORDER BY p.university_id ASC, p.id ASC
            LIMIT ? OFFSET ?
        `;
        const finalQueryParams = [...queryParams, limit, offset];
        const [plans] = await db.query(dataSql, finalQueryParams);

        res.status(200).json({
            code: 200,
            data: {
                total: total,
                page: page,
                limit: limit,
                list: plans
            }
        });

    } catch (error) {
        console.error('获取招生计划失败:', error);
        res.status(500).json({ code: 500, message: '服务器错误：获取招生计划失败' });
    }
});

// --- Filter Options Route ---

// GET /api/data/filter-options - 获取筛选选项 (省份和年份)
router.get('/filter-options', async (req, res) => {
     try {
         // Fetch distinct provinces (consider adding province to majors table too for completeness)
         const [provincesResult] = await db.query(`
            SELECT DISTINCT province FROM universities WHERE province IS NOT NULL AND province != ''
            UNION
            SELECT DISTINCT province FROM control_lines WHERE province IS NOT NULL AND province != ''
         `);
         // Fetch distinct years
          const [yearsResult] = await db.query(`
            SELECT DISTINCT year FROM control_lines WHERE year IS NOT NULL
            UNION
            SELECT DISTINCT year FROM admission_plans WHERE year IS NOT NULL
            ORDER BY year DESC
         `);

          const provinces = provincesResult.map(p => p.province).sort(); // Sort alphabetically
          const years = yearsResult.map(y => y.year); // Already sorted DESC by SQL

          res.status(200).json({ code: 200, data: { provinces, years } });
     } catch (error) {
         console.error('获取筛选选项失败:', error);
         res.status(500).json({ code: 500, message: '服务器错误：获取筛选选项失败' });
     }
});
// --- 新增：获取一分一段数据 ---
router.get('/score-rank', async (req, res) => { // <--- 确认这部分代码存在！
  const { province, year } = req.query;
  // ... (参数校验) ...
  try {
    // 使用数组解构获取查询结果，并将变量命名为 scoreRankResults (或其他清晰的名字)
    const [scoreRankResults] = await db.query(
        'SELECT score, count, cumulative_count FROM score_rank_data WHERE province = ? AND year = ? ORDER BY score DESC',
        [province, parseInt(year)]
    );

    // 在响应中使用正确的变量名 scoreRankResults
    res.status(200).json({ code: 200, data: scoreRankResults });

} catch (error) {
    console.error('获取一分一段数据失败:', error);
    res.status(500).json({ code: 500, message: '获取一分一段数据失败' });
}
});


module.exports = router;