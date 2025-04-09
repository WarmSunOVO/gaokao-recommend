// routes/recommend.js
const express = require('express');
const db = require('../config/db'); // 引入数据库连接池
// const authMiddleware = require('../middleware/auth'); // (可选) 引入认证中间件

const router = express.Router();

router.post('/', async (req, res) => {
  const { province, subjects, score, rank } = req.body;

  // --- 输入校验 (保持不变) ---
  if (!province || !subjects || !Array.isArray(subjects) || subjects.length === 0 || !score || !rank) {
    return res.status(400).json({ code: 400, message: '参数不完整或格式错误' });
  }
  const userRank = Number(rank); // 确保是数字
  if (isNaN(userRank) || userRank <= 0) {
     return res.status(400).json({ code: 400, message: '排名必须是有效数字' });
  }
  // ... 其他校验 ...

  console.log(`收到推荐请求: 省份=${province}, 科目=${subjects.join(',')}, 分数=${score}, 排名=${userRank}`);

  // --- 修正后的推荐逻辑 ---
  try {
    // 1. 定义推荐类别阈值 (基于 rankDiff = 用户排名 - 专业最低录取排名)
    //    !! 这些阈值需要精确调整 !!
    const RANK_DIFF_WEI_THRESHOLD = 500;  // rankDiff > 500 -> 危险
    const RANK_DIFF_CHONG_THRESHOLD = -500; // 500 >= rankDiff > -500 -> 可冲
                                           // rankDiff <= -500 -> 稳定 (保底)

    // 2. 查询数据库 (简化查询，你需要优化和确保数据准确)
    const [universities] = await db.query(`
        SELECT id, name, tags FROM universities WHERE province = ? ORDER BY RAND() LIMIT 10
    `, [province]);
    if (universities.length === 0) {
         return res.status(200).json({ code: 200, message: '该省份暂无学校数据', data: { chong: [], wen: [], wei: [] } });
    }
    const universityIds = universities.map(u => u.id);
    // 确保查询了 admission_rank_min
    const [majors] = await db.query(`
        SELECT id, university_id, name, plan_count, admission_rank_min
        FROM majors
        WHERE university_id IN (?) AND admission_rank_min IS NOT NULL ORDER BY admission_rank_min ASC
    `, [universityIds]); // 按最低位次排序可能有助于后续处理

    // 3. **修正分类逻辑**
    const recommendations = { chong: [], wen: [], wei: [] };
    const addedUniversities = { chong: new Set(), wen: new Set(), wei: new Set() }; // 用于大学去重

    majors.forEach(major => {
      const uni = universities.find(u => u.id === major.university_id);
      if (!uni) return; // 如果找不到对应的大学信息，跳过

      const admissionRankMin = Number(major.admission_rank_min);
      if (isNaN(admissionRankMin)) return; // 无效位次数据，跳过

      const rankDiff = userRank - admissionRankMin;

      // 准备专业数据
      const majorData = {
        id: major.id,
        name: major.name,
        planCount: major.plan_count,
        // 可以根据 rankDiff 粗略计算概率 (极简化示例！)
        probability: Math.max(1, Math.min(99, 50 - Math.round(rankDiff / 100)))
      };

      // 准备大学数据（如果尚未添加）
      const getUniData = (uniId) => ({
            id: uni.id,
            name: uni.name,
            tags: uni.tags ? uni.tags.split(',') : [],
            majors: [] // 初始化专业列表
      });

      // **根据修正后的阈值进行分类**
      if (rankDiff > RANK_DIFF_WEI_THRESHOLD) { // 危险区
        let currentUni = recommendations.wei.find(u => u.id === uni.id);
        if (!currentUni) {
            currentUni = getUniData(uni.id);
            recommendations.wei.push(currentUni);
        }
        currentUni.majors.push(majorData);

      } else if (rankDiff > RANK_DIFF_CHONG_THRESHOLD) { // 可冲区 (500 >= rankDiff > -500)
        let currentUni = recommendations.chong.find(u => u.id === uni.id);
         if (!currentUni) {
            currentUni = getUniData(uni.id);
            recommendations.chong.push(currentUni);
        }
        currentUni.majors.push(majorData);

      } else { // 稳定区 (rankDiff <= -500)
         let currentUni = recommendations.wen.find(u => u.id === uni.id);
         if (!currentUni) {
            currentUni = getUniData(uni.id);
            recommendations.wen.push(currentUni);
        }
        currentUni.majors.push(majorData);
      }
    });

    // 4. 返回结果 (这里不再需要去重，因为上面按分类添加时已处理)
    res.status(200).json({
      code: 200,
      message: '获取推荐成功',
      data: recommendations
    });

  } catch (error) {
    console.error('获取推荐列表失败:', error);
    res.status(500).json({ code: 500, message: '服务器内部错误，获取推荐失败' });
  }
});

module.exports = router;
