// pages/universityQuery/universityQuery.js
const app = getApp(); // 用于获取后端 URL (如果定义了)
const backendUrl = 'http://localhost:3001'; // 或者 app.globalData.backendUrl

Page({
  data: {
    searchValue: '',
    universityList: [], // 原始列表
    filteredList: [], // 显示的列表
    favoriteIds: new Set(), // 存储收藏的大学 ID
    loading: true,
    error: null,
  },

  onLoad(options) {
    this.fetchInitialData();
  },

  // 获取初始数据：大学列表 + 用户收藏
  async fetchInitialData() {
    this.setData({ loading: true, error: null });
    try {
      const [uniRes, favRes] = await Promise.all([
        this.fetchUniversities(),
        this.fetchFavorites('university')
      ]);

      if (uniRes) {
          this.setData({
              universityList: uniRes,
              filteredList: uniRes, // 初始显示全部
          });
      }
       if (favRes) {
          this.setData({ favoriteIds: new Set(favRes) });
      }

    } catch (err) {
      this.setData({ error: '加载数据失败，请稍后重试' });
      console.error("Failed to fetch initial data:", err);
    } finally {
      this.setData({ loading: false });
    }
  },

  // API 调用：获取大学列表
  fetchUniversities() {
      return new Promise((resolve, reject) => {
          wx.request({
              url: `${backendUrl}/api/data/universities`,
              method: 'GET',
              success: (res) => {
                  if (res.statusCode === 200 && res.data.code === 200) {
                      resolve(res.data.data);
                  } else {
                      console.error("获取大学列表失败:", res);
                      reject(new Error(res.data.message || '获取大学列表失败'));
                  }
              },
              fail: (err) => {
                  console.error("请求大学列表接口失败:", err);
                  reject(err);
              }
          });
      });
  },

  // API 调用：获取收藏列表
  fetchFavorites(itemType) {
     return new Promise((resolve, reject) => {
         const token = wx.getStorageSync('token');
         if (!token) {
             console.log('用户未登录，无法获取收藏');
             resolve([]); // 返回空数组
             return;
         }
         wx.request({
             url: `${backendUrl}/api/favorites/${itemType}`,
             method: 'GET',
             header: { 'Authorization': `Bearer ${token}` },
             success: (res) => {
                 if (res.statusCode === 200 && res.data.code === 200) {
                     resolve(res.data.data); // 返回 ID 数组
                 } else if (res.statusCode === 401 || res.statusCode === 403) {
                     console.warn('Token 无效或过期，无法获取收藏');
                     resolve([]);
                 }
                  else {
                     console.error(`获取${itemType}收藏失败:`, res);
                     reject(new Error(res.data.message || '获取收藏失败'));
                 }
             },
             fail: (err) => {
                 console.error(`请求${itemType}收藏接口失败:`, err);
                 reject(err);
             }
         });
     });
  },

  // API 调用：切换收藏状态
  toggleFavoriteAPI(itemId, itemType) {
      return new Promise((resolve, reject) => {
         const token = wx.getStorageSync('token');
         if (!token) {
             wx.showToast({ title: '请先登录', icon: 'none' });
             reject(new Error('未登录'));
             // 可以跳转到登录页 wx.navigateTo({ url: '/pages/login/login' });
             return;
         }
         wx.request({
             url: `${backendUrl}/api/favorites/toggle`,
             method: 'POST',
             header: {
                 'Authorization': `Bearer ${token}`,
                 'Content-Type': 'application/json'
              },
             data: { itemId, itemType },
             success: (res) => {
                 if (res.statusCode === 200 && res.data.code === 200) {
                     resolve(res.data.data.isFavorited); // 返回当前是否收藏的状态
                 } else {
                     console.error("切换收藏失败:", res);
                      wx.showToast({ title: res.data.message || '操作失败', icon: 'none' });
                     reject(new Error(res.data.message || '切换收藏失败'));
                 }
             },
             fail: (err) => {
                 console.error("请求切换收藏接口失败:", err);
                 wx.showToast({ title: '网络错误', icon: 'none' });
                 reject(err);
             }
         });
      });
  },

  // 输入框内容改变时触发搜索 (添加防抖会更好)
  onSearchInput(event) {
    const value = event.detail;
    this.setData({ searchValue: value });
    this.performSearch(value);
  },

  // 点击键盘搜索按钮时触发
  onSearchConfirm(event) {
     const value = event.detail;
     this.performSearch(value);
  },

  // 执行搜索过滤
  performSearch(value) {
    const keyword = value.trim().toLowerCase();
    if (!keyword) {
      // 关键词为空，显示全部
      this.setData({ filteredList: this.data.universityList });
      return;
    }
    const filtered = this.data.universityList.filter(uni =>
      uni.name.toLowerCase().includes(keyword) ||
      (uni.type && uni.type.toLowerCase().includes(keyword)) ||
      (uni.level && uni.level.toLowerCase().includes(keyword))
    );
    this.setData({ filteredList: filtered });
  },

  // 点击收藏按钮
  async toggleFavorite(event) {
    const universityId = event.currentTarget.dataset.id;
    if (!universityId) return;

    // 乐观更新 UI (可选，让用户感觉更快)
    const originalFavIds = new Set(this.data.favoriteIds);
    const newFavIds = new Set(originalFavIds);
    let isCurrentlyFavorited = originalFavIds.has(universityId);
     if (isCurrentlyFavorited) {
         newFavIds.delete(universityId);
     } else {
         newFavIds.add(universityId);
     }
    this.setData({ favoriteIds: newFavIds }); // 先更新界面

    try {
        // 调用 API
        const isFavoritedAfterAPI = await this.toggleFavoriteAPI(universityId, 'university');
        // 根据 API 返回的最终结果再次确认状态 (如果和乐观更新不一致则回滚)
         if (isFavoritedAfterAPI !== !isCurrentlyFavorited) {
             console.warn("API 收藏状态与乐观更新不一致，进行回滚");
             const finalFavIds = new Set(this.data.favoriteIds); // 获取当前最新的状态
             if (isFavoritedAfterAPI) {
                finalFavIds.add(universityId);
             } else {
                 finalFavIds.delete(universityId);
             }
             this.setData({ favoriteIds: finalFavIds });
         }
         wx.showToast({ title: isFavoritedAfterAPI ? '收藏成功' : '取消收藏', icon: 'none', duration: 1000 });

    } catch (error) {
        console.error("切换收藏操作失败:", error);
        // 如果 API 调用失败，回滚 UI
        this.setData({ favoriteIds: originalFavIds });
        // 提示用户操作失败已在 API 函数中处理
    }
  },

   // 点击网址 (可选，复制到剪贴板)
  copyWebsite(event) {
      const url = event.currentTarget.dataset.url;
      if (url) {
          wx.setClipboardData({
              data: url,
              success: () => {
                  wx.showToast({ title: '网址已复制', icon: 'none' });
              }
          });
      }
  }
});