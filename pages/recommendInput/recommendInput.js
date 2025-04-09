// pages/recommendInput/recommendInput.js
Page({
  data: {
    name: '', // 姓名
    province: '', // 省份
    score: '', // 分数
    rank: '', // 排名
    activeCollapse: ['subjects'], // 默认展开科目
    checkedSubjects: [], // 初始为空，或根据需要设置默认值
    isLoading: false // 提交按钮加载状态
  },

  // 折叠面板变化 (保持不变)
  onCollapseChange(event) {
    this.setData({
      activeCollapse: event.detail,
    });
  },

  // 复选框变化 (保持不变)
  onCheckboxChange(event) {
    this.setData({
      checkedSubjects: event.detail,
    });
    console.log('选中的科目:', this.data.checkedSubjects);
  },

  // 通用输入处理
  onFieldInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [field]: event.detail
    });
  },

  // 提交按钮事件
  handleSubmit() {
    // 1. 前端校验 (添加更详细的校验)
    if (!this.data.name.trim()) { return wx.showToast({ title: '请输入姓名', icon: 'none' }); }
    if (!this.data.province.trim()) { return wx.showToast({ title: '请输入省份', icon: 'none' }); }
    // 校验科目选择数量 (示例：新高考至少选3科)
    if (this.data.checkedSubjects.length < 3) { return wx.showToast({ title: '请至少选择3个科目', icon: 'none' }); }
    if (!this.data.score || isNaN(Number(this.data.score)) || Number(this.data.score) <= 0) { return wx.showToast({ title: '请输入有效的高考分数', icon: 'none' }); }
    if (!this.data.rank || isNaN(Number(this.data.rank)) || Number(this.data.rank) <= 0) { return wx.showToast({ title: '请输入有效的高考排名', icon: 'none' }); }

    // 2. 设置加载状态
    this.setData({ isLoading: true });

    // 3. 准备发送到后端的数据
    const requestData = {
      name: this.data.name,
      province: this.data.province,
      subjects: this.data.checkedSubjects,
      score: Number(this.data.score),
      rank: Number(this.data.rank),
      // 如果需要用户信息，可以从缓存获取 token 或 userId
      // userId: wx.getStorageSync('userInfo')?.id
    };
    console.log("发送推荐请求数据:", requestData);

    // 4. 调用后端 API (需要你的后端提供 /api/recommend 接口)
    wx.request({
      // !! 重要：替换成你的后端推荐接口地址 !!
      // 可能需要携带 token 进行用户认证
      // header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` },
      url: 'http://localhost:3001/api/recommend', // <--- 修改为你的后端地址
      method: 'POST',
      data: requestData,
      success: (res) => {
        console.log("后端推荐响应:", res);
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          // 推荐成功
          wx.showToast({ title: '获取推荐成功', icon: 'success', duration: 1000 });

          // 跳转到结果页，并通过 eventChannel 传递数据
          wx.navigateTo({
            url: '/pages/recommendResult/recommendResult',
            success: (navRes) => {
              // 通过eventChannel向被打开页面传送数据
              navRes.eventChannel.emit('acceptDataFromOpenerPage', { recommendations: res.data.data })
              console.log("推荐数据已通过 eventChannel 发送");
            },
            fail: (navErr) => {
               console.error("跳转到结果页失败:", navErr);
               wx.showToast({ title: '无法打开结果页面', icon: 'none' });
            }
          });

        } else {
          // 后端返回错误或数据格式不对
          const errMsg = (res.data && res.data.message) ? res.data.message : '获取推荐失败，请稍后重试';
          wx.showToast({ title: errMsg, icon: 'none', duration: 2000 });
        }
      },
      fail: (err) => {
        console.error("推荐请求失败:", err);
        wx.showToast({ title: '网络错误，请检查网络连接', icon: 'none' });
      },
      complete: () => {
        // 5. 取消加载状态
        this.setData({ isLoading: false });
      }
    });
  }
});