// pages/index/index.js
Page({
  data: {
    // ... (你可能有的其他 data)
  },

  onLoad() {}, // 或者 onShow

  // --- 首页 Grid Item 点击事件 ---

  navigateToRecommend() {
    console.log("跳转到信息填写页");
    wx.navigateTo({
      url: '/pages/recommendInput/recommendInput'
    });
  },
  navigateToUniversityQuery() {
    console.log("尝试跳转到大学信息查询页..."); // 加一句日志方便调试
    wx.navigateTo({
      url: '/pages/universityQuery/universityQuery', // <--- 确认目标路径正确
      fail: (err) => { // <--- 添加跳转失败的回调，方便看错误
        console.error("跳转到 universityQuery 失败:", err);
        wx.showToast({
          title: '无法打开页面',
          icon: 'none'
        })
      }
    });
  },
  navigateToMajorQuery() {
    console.log("尝试跳转到查专业页..."); // 加一句日志方便调试
    wx.navigateTo({
      url: '/pages/majorQuery/majorQuery', // <--- 确认目标路径正确
      fail: (err) => { // <--- 添加跳转失败的回调
        console.error("跳转到 majorQuery 失败:", err);
        wx.showToast({
          title: '无法打开页面',
          icon: 'none'
        })
      }
    });
  },
  navigateToScoreRank() {
    console.log("尝试跳转到一分一段表页..."); // 加日志
    wx.navigateTo({
      url: '/pages/scoreRank/scoreRank', // <--- 确认目标路径正确
      fail: (err) => { // <--- 添加失败回调
        console.error("跳转到 scoreRank 失败:", err);
        wx.showToast({
          title: '无法打开页面',
          icon: 'none'
        })
      }
    });
  },
  navigateToProvinceLine() {
    console.log("跳转到省控线查询页...");
    wx.navigateTo({
      url: '/pages/provinceLine/provinceLine',
      fail: (err) => { console.error("跳转到 provinceLine 失败:", err); wx.showToast({ title: '无法打开页面', icon: 'none' }); }
    });
  },

  // 🚀 修正后的跳转函数
  navigateToUniversityInfo() {
    wx.navigateTo({
      url: '/pages/universityInfo/universityInfo'
    });
  },

  navigateToAdmissionPlan() {
    console.log("跳转到招生计划查询页...");
    wx.navigateTo({
      url: '/pages/admissionPlan/admissionPlan',
      fail: (err) => { console.error("跳转到 admissionPlan 失败:", err); wx.showToast({ title: '无法打开页面', icon: 'none' }); }
    });
  },
});