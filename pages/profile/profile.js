// pages/profile/profile.js
const app = getApp();

Page({
  data: {
    isLoggedIn: false, // 控制显示游客还是已登录信息
    userInfo: {} // 存储已登录的用户信息
  },

  onShow() {
    // 页面显示时检查登录状态
    this.checkLoginStatus();

    // --- 同时确保 TabBar 状态正确 (如果你的 TabBar 是自定义组件方式) ---
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 2 // 个人中心的索引是 2
      });
    }
    // --- TabBar 处理结束 ---
  },

  // 检查本地存储判断登录状态
  checkLoginStatus() {
    try {
      const token = wx.getStorageSync('token');
      const userInfo = wx.getStorageSync('userInfo');
      console.log("Profile Page - 读取缓存:", token, userInfo); // 调试
      if (token && userInfo) {
        this.setData({
          isLoggedIn: true,
          userInfo: userInfo
        });
        // // (可选) 同时更新全局状态
        // app.globalData.token = token;
        // app.globalData.userInfo = userInfo;
      } else {
        this.setData({
          isLoggedIn: false,
          userInfo: {}
        });
        // // (可选) 清空全局状态
        // app.globalData.token = null;
        // app.globalData.userInfo = null;
      }
    } catch (e) {
      console.error("读取登录状态缓存失败:", e);
      this.setData({ // 出错时也认为未登录
        isLoggedIn: false,
        userInfo: {}
      });
    }
  },

  // --- 登出功能 ---
  handleLogout() {
     wx.showModal({
       title: '提示',
       content: '确定要退出登录吗？',
       success: (res) => {
         if (res.confirm) {
           console.log('用户点击确定退出');
           try {
             // 1. 清除本地缓存
             wx.removeStorageSync('token');
             wx.removeStorageSync('userInfo');

             // // 2. (可选) 清除全局状态
             // app.globalData.token = null;
             // app.globalData.userInfo = null;

             // 3. 更新当前页面状态
             this.setData({
               isLoggedIn: false,
               userInfo: {}
             });

             wx.showToast({ title: '已退出登录', icon: 'none' });

             // 4. (可选) 通知其他页面刷新状态，或者跳转到首页等
             // wx.switchTab({ url: '/pages/index/index' });

           } catch (e) {
              console.error("清除缓存失败:", e);
              wx.showToast({ title: '退出登录失败', icon: 'none' });
           }
         } else if (res.cancel) {
           console.log('用户点击取消退出');
         }
       }
     });
  },
  // --- 登出功能结束 ---


  // 跳转到登录页
  gotoLogin() {
    if (!this.data.isLoggedIn) {
      wx.navigateTo({
        url: '/pages/login/login',
      });
    }
  },

  // 跳转到会员开通页 (示例)
  gotoMembership() {
    wx.showToast({ title: '功能暂未开放', icon: 'none' });
  },

  // 处理 Grid 快捷入口点击 (示例)
  handleGridClick(event) {
    const target = event.currentTarget.dataset.target;
    wx.showToast({ title: `点击了: ${target}`, icon: 'none' });
  },

  // 跳转到设置页 (示例)
  gotoSettings() {
     wx.showToast({ title: '跳转到设置页', icon: 'none' });
  },

   // 需要登录才能访问的页面跳转检查 (保持不变)
   checkLoginAndNavigate(event) {
    console.log("检查登录并跳转..."); // 添加日志
    console.log("当前登录状态:", this.data.isLoggedIn); // 打印登录状态

    if (!this.data.isLoggedIn) { // 检查是否未登录
        wx.showToast({
            title: '请先登录',
            icon: 'none',
            duration: 1500,
            complete: () => {
                setTimeout(() => {
                    this.gotoLogin(); // 跳转到登录页
                }, 1500);
            }
        });
    } else { // 如果已登录
        // 获取 WXML 中 data-url 的值
        const url = event.currentTarget.dataset.url;
        console.log("目标 URL:", url); // 打印获取到的 URL

        if (url) { // 确保 URL 存在
            wx.navigateTo({ // 执行跳转
                url: url,
                fail: (err) => { // 添加失败回调
                    console.error(`跳转到 ${url} 失败:`, err);
                     wx.showToast({ title: '无法打开页面', icon: 'none' });
                }
             });
        } else {
            console.error("在 van-cell 上未找到有效的 data-url 属性");
             wx.showToast({ title: '页面路径配置错误', icon: 'none' });
        }
    }
},
});