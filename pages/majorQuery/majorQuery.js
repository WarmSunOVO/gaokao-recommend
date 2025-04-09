// pages/majorQuery/majorQuery.js
const app = getApp();
const backendUrl = 'http://localhost:3001'; // Or app.globalData.backendUrl if defined

Page({
  data: {
    searchValue: '',
    majorGroups: [], // Original full list of grouped majors
    filteredGroups: [], // List displayed after search
    favoriteIds: new Set(), // Stores IDs of favorited majors for quick lookup
    loading: true,
    error: null,
  },

  onLoad(options) {
    this.fetchInitialData();
  },

  // --- Data Fetching ---
  async fetchInitialData() {
      this.setData({ loading: true, error: null });
      try {
          // Fetch major groups and user's major favorites concurrently
          const [groupsRes, favRes] = await Promise.all([
              this.fetchMajorsGrouped(),
              this.fetchFavorites('major') // Fetch MAJOR favorites
          ]);

          if (groupsRes) {
             this.setData({
                 majorGroups: groupsRes,
                 filteredGroups: groupsRes, // Initially show all
             });
          }
           if (favRes) {
              // Initialize the Set with fetched favorite IDs
              this.setData({ favoriteIds: new Set(favRes) });
              console.log("Loaded favorite major IDs:", this.data.favoriteIds);
          }

      } catch (err) {
          this.setData({ error: '加载数据失败，请稍后重试' });
           console.error("Failed to fetch initial major data:", err);
      } finally {
          this.setData({ loading: false });
      }
  },

  // API Call: Fetch grouped majors
  fetchMajorsGrouped() {
     // ... (Keep the existing fetchMajorsGrouped function) ...
      return new Promise((resolve, reject) => {
          wx.request({
              url: `${backendUrl}/api/data/majors/grouped`, method: 'GET',
              success: (res) => { if (res.statusCode === 200 && res.data.code === 200) { resolve(res.data.data); } else { console.error("获取专业列表失败:", res); reject(new Error(res.data.message || '获取专业列表失败')); } },
              fail: (err) => { console.error("请求专业列表接口失败:", err); reject(err); }
          });
      });
  },

  // API Call: Fetch user's favorites for a given type
  fetchFavorites(itemType) {
     // ... (Keep the existing fetchFavorites function or use a shared one) ...
      return new Promise((resolve, reject) => {
         const token = wx.getStorageSync('token');
         if (!token) { resolve([]); console.log('用户未登录，无法获取收藏'); return; } // Return empty if not logged in
         wx.request({
             url: `${backendUrl}/api/favorites/${itemType}`, method: 'GET', header: { 'Authorization': `Bearer ${token}` },
             success: (res) => { if (res.statusCode === 200 && res.data.code === 200) { resolve(res.data.data); } else if (res.statusCode === 401 || res.statusCode === 403){ console.warn('Token无效或过期，无法获取收藏'); resolve([]);} else { console.error(`获取${itemType}收藏失败:`, res); reject(new Error(res.data.message || '获取收藏失败')); } },
             fail: (err) => { console.error(`请求${itemType}收藏接口失败:`, err); reject(err); }
         });
     });
  },

  // API Call: Toggle favorite status
  toggleFavoriteAPI(itemId, itemType) {
     // ... (Keep the existing toggleFavoriteAPI function or use a shared one) ...
      return new Promise((resolve, reject) => {
         const token = wx.getStorageSync('token');
         if (!token) {
             wx.showToast({ title: '请先登录', icon: 'none' });
             // Optional: Redirect to login
             wx.navigateTo({ url: '/pages/login/login' });
             reject(new Error('未登录'));
             return;
         }
         wx.request({
             url: `${backendUrl}/api/favorites/toggle`, method: 'POST', header: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, data: { itemId, itemType },
             success: (res) => { if (res.statusCode === 200 && res.data.code === 200) { resolve(res.data.data.isFavorited); } else { console.error("切换收藏失败:", res); wx.showToast({ title: res.data.message || '操作失败', icon: 'none' }); reject(new Error(res.data.message || '切换收藏失败')); } },
             fail: (err) => { console.error("请求切换收藏接口失败:", err); wx.showToast({ title: '网络错误', icon: 'none' }); reject(err); }
         });
      });
  },

  // --- Search Handling ---
  onSearchInput(event) {
    const value = event.detail;
    this.setData({ searchValue: value });
    this.performSearch(value);
  },
  onSearchConfirm(event) {
     const value = event.detail;
     this.performSearch(value);
  },
  performSearch(value) {
    // ... (Keep the existing performSearch function) ...
    const keyword = value.trim().toLowerCase();
    if (!keyword) { this.setData({ filteredGroups: this.data.majorGroups }); return; }
    const filtered = this.data.majorGroups.map(group => {
      const filteredMajors = group.majors.filter(major => major.name.toLowerCase().includes(keyword) || (major.code && major.code.toLowerCase().includes(keyword)));
      if (group.categoryName.toLowerCase().includes(keyword) || filteredMajors.length > 0) { return { ...group, majors: filteredMajors }; } return null;
    }).filter(group => group !== null);
    this.setData({ filteredGroups: filtered });
  },

  // --- Favorite Button Click Handler ---
  async toggleFavorite(event) {
    const majorId = event.currentTarget.dataset.id; // Get major ID from data-id
    if (!majorId) {
        console.error("无法获取专业ID");
        return;
    }

    const originalFavIds = new Set(this.data.favoriteIds); // Store original state for rollback
    const newFavIds = new Set(originalFavIds);
    let isCurrentlyFavorited = originalFavIds.has(majorId); // Check current state

    // Optimistic UI update: Toggle state immediately
    if (isCurrentlyFavorited) {
        newFavIds.delete(majorId);
    } else {
        newFavIds.add(majorId);
    }
    this.setData({ favoriteIds: newFavIds }); // Update UI instantly

    try {
        // Call the backend API to actually toggle the favorite status
        const isFavoritedAfterAPI = await this.toggleFavoriteAPI(majorId, 'major'); // Pass 'major' as itemType

        // Verify if API result matches optimistic update (optional but good practice)
        if (isFavoritedAfterAPI === isCurrentlyFavorited) { // API result contradicts optimistic update
             console.warn("API 收藏状态与乐观更新不一致，进行同步");
             // Correct the UI state based on the definitive API response
             const finalFavIds = new Set(this.data.favoriteIds);
              if (isFavoritedAfterAPI) {
                  finalFavIds.add(majorId);
              } else {
                  finalFavIds.delete(majorId);
              }
             this.setData({ favoriteIds: finalFavIds });
        }

        // Show success feedback
        wx.showToast({ title: isFavoritedAfterAPI ? '收藏成功' : '取消收藏', icon: 'none', duration: 1000 });

    } catch (error) {
        // API call failed, rollback the UI change
        console.error("切换专业收藏操作失败:", error);
        this.setData({ favoriteIds: originalFavIds });
        // Error toast is likely shown within toggleFavoriteAPI on failure
    }
  }
});