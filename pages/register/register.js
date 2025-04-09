// pages/register/register.js
Page({
  data: {
    // --- 表单数据绑定 ---
    account: '',
    name: '', // 姓名 (可选)
    phone: '', // 手机号 (通常必填)
    password: '',
    confirmPassword: '',
    gender: '', // 性别 (可选)
    idCard: '', // 身份证号 (可选)
    // --- 状态控制 ---
    isLoading: false // 控制按钮加载状态
  },

  // --- 输入处理 ---
  // 使用一个函数处理所有输入，通过 data-field 区分
  onFieldInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [field]: event.detail // event.detail 是 vant field 输入的值
    });
  },

  // --- 注册按钮点击事件 ---
  handleRegister() {
    // 1. 前端基础校验
    if (!this.data.account) {
      wx.showToast({ title: '请输入账号', icon: 'none' });
      return;
    }
    if (!this.data.phone) { // 假设手机号必填
      wx.showToast({ title: '请输入手机号码', icon: 'none' });
      return;
    }
    // 简单的手机号格式校验 (可以更严格)
    if (!/^1[3-9]\d{9}$/.test(this.data.phone)) {
       wx.showToast({ title: '手机号码格式不正确', icon: 'none' });
       return;
    }
    if (!this.data.password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    // 密码长度校验示例
    if (this.data.password.length < 6 || this.data.password.length > 16) {
      wx.showToast({ title: '密码长度应为6-16位', icon: 'none' });
      return;
    }
    if (!this.data.confirmPassword) {
      wx.showToast({ title: '请再次输入密码', icon: 'none' });
      return;
    }
    if (this.data.password !== this.data.confirmPassword) {
      wx.showToast({ title: '两次输入的密码不一致', icon: 'none' });
      return;
    }
    // 可以添加其他字段的校验，如身份证格式等

    // 2. 显示加载状态
    this.setData({ isLoading: true });

    // 3. 调用后端注册接口
    const registerData = {
      account: this.data.account,
      name: this.data.name,
      phone: this.data.phone,
      password: this.data.password, // **重要：实际生产中，密码绝不能明文传输！应在后端处理加密**
      gender: this.data.gender,
      idCard: this.data.idCard // **重要：敏感信息也应考虑加密**
    };

    console.log("准备发送注册数据:", registerData); // 调试用

    wx.request({
      url: 'http://localhost:3001/api/auth/register', // <--- 替换成你的后端注册接口地址!
      method: 'POST',
      data: registerData,
      header: {
        'content-type': 'application/json' // 根据后端要求设置
      },
      success: (res) => {
        console.log("后端注册响应:", res); // 调试用
        // 4. 处理后端响应
        // 你需要根据你的后端实际返回的数据结构来判断
        if (res.statusCode === 200 && res.data && res.data.code === 200) { // 假设成功时 status 200, 且返回体有 { code: 200, ... }
          wx.showToast({ title: '注册成功!', icon: 'success' });
          // 注册成功后，可以选择跳转到登录页
          setTimeout(() => {
            wx.redirectTo({ // 使用 redirectTo 避免用户按返回键回到注册页
              url: '/pages/login/login'
            });
          }, 1500); // 延迟一点给用户看提示

        } else {
          // 显示后端返回的错误信息，或通用错误提示
          const errMsg = (res.data && res.data.message) ? res.data.message : '注册失败，请稍后再试';
          wx.showToast({ title: errMsg, icon: 'none', duration: 2000 });
        }
      },
      fail: (err) => {
        // 网络错误或其他请求错误
        console.error("注册请求失败:", err);
        wx.showToast({ title: '网络请求失败，请检查网络', icon: 'none' });
      },
      complete: () => {
        // 5. 无论成功失败，都取消加载状态
        this.setData({ isLoading: false });
      }
    });
  },

  // 返回登录页
  gotoLogin() {
    wx.navigateBack(); // 返回上一页 (通常是登录页)
  }
});