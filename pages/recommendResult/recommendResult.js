// pages/recommendResult/recommendResult.js
Page({
  data: {
    activeTab: 0, // 默认显示第一个 Tab
    recommendations: { // 初始化推荐数据结构
      chong: [],
      wen: [],
      wei: []
    },
    isLoading: true // 初始加载状态
  },

  // onLoad 周期函数，用于接收上个页面传来的数据
  onLoad(options) {
    this.setData({ isLoading: true }); // 开始加载
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on('acceptDataFromOpenerPage', (data) => {
        console.log("收到来自 recommendInput 页面的数据:", data);
        if (data && data.recommendations) {
          this.setData({
            recommendations: data.recommendations,
            isLoading: false // 数据加载完成
          });
        } else {
          console.error("从上页接收到的推荐数据格式不正确");
          this.setData({ isLoading: false }); // 加载失败
           wx.showToast({ title: '加载推荐数据失败', icon: 'none' });
        }
      });
    } else {
        console.error("无法获取 eventChannel");
        this.setData({ isLoading: false }); // 加载失败
        wx.showToast({ title: '无法加载推荐数据', icon: 'none' });
    }
  },

  // Tab 切换事件 (保持不变)
  onTabChange(event) {
    const tabIndex = event.detail.index;
    this.setData({ activeTab: tabIndex });
    console.log('切换到 Tab:', event.detail.title);
  },

  // (新增) 添加到志愿表的按钮事件 (占位)
  addToVolunteer(event) {
      const { uni, major } = event.currentTarget.dataset; // 获取 WXML 中绑定的数据
      console.log('尝试添加志愿:', uni.name, major.name);
      // 这里需要实现将志愿添加到用户列表的逻辑
      // 可能是存储到本地缓存，或者调用后端接口保存
      wx.showToast({ title: `已添加 ${major.name}`, icon: 'none' }); // 简单提示
  }
});