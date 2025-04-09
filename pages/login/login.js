// pages/login/login.js
const app = getApp(); // 可能需要获取全局 app 实例

Page({
  data: {
    // --- 表单数据 ---
    account: '', // 账号，可以是用户名、手机号等
    password: '',
    // --- 状态控制 ---
    isLoading: false
  },

  // --- 输入处理 ---
  onFieldInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [field]: event.detail
    });
  },

  // --- 登录按钮点击 ---
  handleLogin() {
    // 1. 前端校验
    if (!this.data.account) {
      wx.showToast({ title: '请输入账号', icon: 'none' });
      return;
    }
    if (!this.data.password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }

    // 2. 显示加载
    this.setData({ isLoading: true });

    // 3. 调用后端登录接口
    const loginData = {
      account: this.data.account,
      password: this.data.password // **同样，密码不应明文传输**
    };

    console.log("准备发送登录数据:", loginData);

    wx.request({
      url: 'https://localhost/api/auth/login', // <--- 替换成你的后端登录接口地址!
      method: 'POST',
      data: loginData,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log("后端登录响应:", res);
        // 4. 处理响应
        // 同样需要根据你的后端实际返回来判断
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          // 登录成功
          wx.showToast({ title: '登录成功', icon: 'success' });

          // **核心步骤：存储登录凭证和用户信息**
          // 假设后端成功返回 { code: 200, message: '...', data: { token: 'xxx', userInfo: { id: 1, nickName: '...', avatarUrl: '...' } } }
          if (res.data.data && res.data.data.token && res.data.data.userInfo) {
            try {
              wx.setStorageSync('token', res.data.data.token); // 存储 token
              wx.setStorageSync('userInfo', res.data.data.userInfo); // 存储用户信息
              console.log('Token 和用户信息已存储');

              // // 如果需要更新全局 app data (可选)
              // app.globalData.token = res.data.data.token;
              // app.globalData.userInfo = res.data.data.userInfo;

              // 登录成功后，返回之前的页面 (通常是 profile 页触发的登录)
              setTimeout(() => {
                 wx.navigateBack({
                   delta: 1 // 返回上一页
                 });
                 // 如果不是上一页触发的，或者想强制去个人中心
                 // wx.switchTab({ url: '/pages/profile/profile' });
              }, 1000); // 延迟一点

            } catch (e) {
              console.error("存储 token 或用户信息失败:", e);
              wx.showToast({ title: '登录状态保存失败', icon: 'none' });
            }
          } else {
            // 后端返回成功，但数据结构不对
             wx.showToast({ title: '登录响应数据格式错误', icon: 'none' });
          }

        } else {
          // 登录失败
          const errMsg = (res.data && res.data.message) ? res.data.message : '账号或密码错误';
          wx.showToast({ title: errMsg, icon: 'none', duration: 2000 });
        }
      },
      fail: (err) => {
        console.error("登录请求失败:", err);
        wx.showToast({ title: '网络请求失败', icon: 'none' });
      },
      complete: () => {
        // 5. 取消加载状态
        this.setData({ isLoading: false });
      }
    });
  },

  // 跳转到注册页
  gotoRegister() {
    wx.navigateTo({
      url: '/pages/register/register',
    });
  },

  // 忘记密码处理
  gotoForgotPassword() {
    wx.showToast({ title: '功能暂未开放', icon: 'none' });
  }
});