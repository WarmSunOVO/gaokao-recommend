// pages/myCollections.js
const app = getApp();
const backendUrl = 'http://localhost:3001'; // Or app.globalData.backendUrl

Page({
  data: {
    favoriteUniversities: [],
    favoriteMajors: [],
    loading: true,
    error: null,
    activeTab: 0, // 0 for Universities, 1 for Majors
  },

  onLoad(options) {
    // onLoad or onShow depending on whether you want data to refresh every time
    this.loadFavoriteDetails();
  },

  // 下拉刷新
  onPullDownRefresh() {
      console.log("Triggering pull down refresh");
      this.loadFavoriteDetails().finally(() => {
          wx.stopPullDownRefresh(); // 停止下拉刷新动画
      });
  },

  // 加载收藏详情
  async loadFavoriteDetails() {
    this.setData({ loading: true, error: null });
    const token = wx.getStorageSync('token');
    if (!token) {
        this.setData({ loading: false, error: '请先登录查看收藏' });
         // Optional: Redirect to login after a delay
         setTimeout(() => wx.navigateTo({ url: '/pages/login/login' }), 1500);
        return;
    }

    try {
      // 并发获取收藏的大学和专业详情
      const [uniRes, majorRes] = await Promise.all([
        this.fetchFavoriteDetailsAPI('university', token),
        this.fetchFavoriteDetailsAPI('major', token)
      ]);

      this.setData({
        favoriteUniversities: uniRes || [], // Use empty array if fetch fails
        favoriteMajors: majorRes || [],   // Use empty array if fetch fails
        loading: false,
        error: (!uniRes && !majorRes) ? '加载收藏失败' : null // Show error only if both fail
      });
      console.log("Loaded favorite universities:", this.data.favoriteUniversities);
      console.log("Loaded favorite majors:", this.data.favoriteMajors);

    } catch (err) { // Catch errors from Promise.all
      this.setData({ loading: false, error: '加载收藏数据时出错' });
      console.error("Failed to load favorite details:", err);
    }
  },

  // 统一的获取收藏详情 API 调用函数
  fetchFavoriteDetailsAPI(itemType, token) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${backendUrl}/api/favorites/details/${itemType}`,
        method: 'GET',
        header: { 'Authorization': `Bearer ${token}` },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 200) {
            resolve(res.data.data); // 返回详情数组
          } else if (res.statusCode === 401 || res.statusCode === 403) {
            console.warn(`Token无效或过期，无法获取${itemType}收藏详情`);
             this.setData({ error: '登录已过期，请重新登录' });
             // Optional: Redirect to login
             // setTimeout(() => wx.navigateTo({ url: '/pages/login/login' }), 1500);
            resolve(null); // Indicate failure but don't break Promise.all
          }
           else {
            console.error(`获取${itemType}收藏详情失败:`, res);
            resolve(null); // Indicate failure
          }
        },
        fail: (err) => {
          console.error(`请求${itemType}收藏详情接口失败:`, err);
          resolve(null); // Indicate failure
        }
      });
    });
  },

  // Tab 切换
  onTabChange(event) {
    this.setData({ activeTab: event.detail.index });
  },

  // --- 取消收藏逻辑 ---
  async removeFavorite(event) {
      const { id, type } = event.currentTarget.dataset;
      if (!id || !type) return;

      wx.showModal({
          title: '提示',
          content: `确定要取消收藏这个${type === 'university' ? '院校' : '专业'}吗？`,
          success: async (res) => {
              if (res.confirm) {
                  try {
                      // 调用后端取消收藏
                       await this.toggleFavoriteAPI(id, type); // toggleFavoriteAPI already handles UI feedback

                      // 从当前页面的列表中移除该项 (优化体验)
                      if (type === 'university') {
                          this.setData({
                              favoriteUniversities: this.data.favoriteUniversities.filter(item => item.id !== id)
                          });
                      } else if (type === 'major') {
                           this.setData({
                              favoriteMajors: this.data.favoriteMajors.filter(item => item.id !== id)
                          });
                      }
                  } catch (error) {
                       // 错误提示已在 toggleFavoriteAPI 中处理
                       console.error("取消收藏时发生错误:", error);
                  }
              }
          }
      });
  },

   // API Call: Toggle favorite status (复用或从其他页面引入)
  toggleFavoriteAPI(itemId, itemType) {
     // ... (与 majorQuery.js / universityQuery.js 中的代码相同) ...
      return new Promise((resolve, reject) => {
         const token = wx.getStorageSync('token');
         if (!token) { wx.showToast({ title: '请先登录', icon: 'none' }); reject(new Error('未登录')); return; }
         wx.request({
             url: `${backendUrl}/api/favorites/toggle`, method: 'POST', header: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, data: { itemId, itemType },
             success: (res) => { if (res.statusCode === 200 && res.data.code === 200) { wx.showToast({ title: res.data.data.isFavorited ? '收藏成功' : '取消收藏', icon: 'none', duration: 1000 }); resolve(res.data.data.isFavorited); } else { console.error("切换收藏失败:", res); wx.showToast({ title: res.data.message || '操作失败', icon: 'none' }); reject(new Error(res.data.message || '切换收藏失败')); } },
             fail: (err) => { console.error("请求切换收藏接口失败:", err); wx.showToast({ title: '网络错误', icon: 'none' }); reject(err); }
         });
      });
  },

   // 点击网址 (可选，复制到剪贴板) - 复用 universityQuery 的
  copyWebsite(event) {
      // ... (与 universityQuery.js 中的代码相同) ...
      const url = event.currentTarget.dataset.url;
      if (url) { wx.setClipboardData({ data: url, success: () => { wx.showToast({ title: '网址已复制', icon: 'none' }); } }); }
  }

});