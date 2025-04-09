// pages/admissionPlan/admissionPlan.js
const app = getApp();
const backendUrl = 'http://localhost:3001'; // 或全局获取

Page({
  data: {
    searchValue: '',
    planList: [], // 当前页的计划列表
    total: 0, // 总记录数
    page: 1, // 当前页码
    limit: 15, // 每页数量
    loading: false, // 主加载状态
    loadingMore: false, // 加载更多状态
    error: null,
    noMoreData: false, // 是否已加载所有数据
    favoriteUniIds: new Set(), // 收藏的大学ID，用于收藏按钮状态
  },

  onLoad(options) {
    this.loadInitialData();
    this.fetchInitialFavorites(); // 获取初始收藏状态
  },

  // 初始加载数据
  loadInitialData() {
      this.setData({ page: 1, planList: [], noMoreData: false });
      this.fetchAdmissionPlans(true); // true 表示是初始加载
  },

  // 触底加载更多
  onReachBottom() {
      if (this.data.loading || this.data.loadingMore || this.data.noMoreData) {
          return; // 防止重复加载
      }
      this.setData({ page: this.data.page + 1 });
      this.fetchAdmissionPlans(false); // false 表示是加载更多
  },

  // API 调用：获取招生计划
  async fetchAdmissionPlans(isInitialLoad = false) {
      if (isInitialLoad) {
          this.setData({ loading: true, error: null });
      } else {
          this.setData({ loadingMore: true });
      }
      const { searchValue, page, limit } = this.data;

      try {
          const res = await new Promise((resolve, reject) => {
               wx.request({
                  url: `${backendUrl}/api/data/admission-plans`,
                  data: { keyword: searchValue, page, limit },
                  success: resolve,
                  fail: reject
              });
          });

          if (res.statusCode === 200 && res.data.code === 200) {
              const { list, total } = res.data.data;
              this.setData({
                  planList: isInitialLoad ? list : [...this.data.planList, ...list], // 初始加载覆盖，加载更多拼接
                  total: total,
                  loading: false,
                  loadingMore: false,
                  noMoreData: (isInitialLoad ? list.length : this.data.planList.length + list.length) >= total, // 判断是否已加载完
                  error: null
              });
          } else {
              throw new Error(res.data.message || '加载招生计划失败');
          }
      } catch (error) {
          console.error("获取招生计划失败:", error);
          this.setData({
              loading: false,
              loadingMore: false,
              error: this.data.planList.length === 0 ? '加载失败，请稍后重试' : null // 只有列表为空时才显示整体错误
          });
          if (!isInitialLoad) { // 加载更多失败，页码回退
              this.setData({ page: this.data.page - 1 });
          }
      }
  },

  // API 调用：获取收藏列表 (复用)
  fetchFavorites(itemType) {
     // ... (与 universityQuery.js 中的 fetchFavorites 相同) ...
      return new Promise((resolve, reject) => {
         const token = wx.getStorageSync('token'); if (!token) { resolve([]); return; }
         wx.request({ url: `${backendUrl}/api/favorites/${itemType}`, method: 'GET', header: { 'Authorization': `Bearer ${token}` }, success: (res) => { if (res.statusCode === 200 && res.data.code === 200) { resolve(res.data.data); } else { resolve([]); } }, fail: (err) => { reject(err); } });
      });
  },
   // 获取初始收藏，用于按钮状态
  async fetchInitialFavorites() {
      try {
          const favRes = await this.fetchFavorites('university'); // 获取收藏的大学 ID
          if (favRes) { this.setData({ favoriteUniIds: new Set(favRes) }); }
      } catch (error) { console.error("加载初始收藏失败:", error); }
  },


  // API 调用：切换收藏状态 (复用)
  toggleFavoriteAPI(itemId, itemType) {
     // ... (与 universityQuery.js 中的 toggleFavoriteAPI 相同) ...
      return new Promise((resolve, reject) => {
         const token = wx.getStorageSync('token'); if (!token) { wx.showToast({ title: '请先登录', icon: 'none' }); wx.navigateTo({ url: '/pages/login/login' }); reject(new Error('未登录')); return; }
         wx.request({ url: `${backendUrl}/api/favorites/toggle`, method: 'POST', header: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, data: { itemId, itemType }, success: (res) => { if (res.statusCode === 200 && res.data.code === 200) { resolve(res.data.data.isFavorited); } else { wx.showToast({ title: res.data.message || '操作失败', icon: 'none' }); reject(new Error(res.data.message || '切换收藏失败')); } }, fail: (err) => { wx.showToast({ title: '网络错误', icon: 'none' }); reject(err); } });
      });
  },

  // 搜索处理
  onSearchInput(event) {
    this.setData({ searchValue: event.detail });
    // 可以加入防抖优化
    this.loadInitialData(); // 输入改变时重新从第一页搜索
  },
  onSearchConfirm(event) {
     this.setData({ searchValue: event.detail });
     this.loadInitialData(); // 确认搜索时也重新从第一页搜索
  },

  // 点击收藏按钮 (收藏的是大学)
  async toggleFavorite(event) {
    const universityId = event.currentTarget.dataset.id; // 获取大学 ID
    if (!universityId) return;

    const originalFavIds = new Set(this.data.favoriteUniIds);
    const newFavIds = new Set(originalFavIds);
    let isCurrentlyFavorited = originalFavIds.has(universityId);
     if (isCurrentlyFavorited) { newFavIds.delete(universityId); } else { newFavIds.add(universityId); }
    this.setData({ favoriteUniIds: newFavIds }); // 乐观更新

    try {
        const isFavoritedAfterAPI = await this.toggleFavoriteAPI(universityId, 'university');
         if (isFavoritedAfterAPI === isCurrentlyFavorited) {
             const finalFavIds = new Set(this.data.favoriteUniIds);
             if (isFavoritedAfterAPI) { finalFavIds.add(universityId); } else { finalFavIds.delete(universityId); }
             this.setData({ favoriteUniIds: finalFavIds });
         }
         wx.showToast({ title: isFavoritedAfterAPI ? '收藏成功' : '取消收藏', icon: 'none', duration: 1000 });
    } catch (error) {
        this.setData({ favoriteUniIds: originalFavIds }); // 回滚
    }
  }
});