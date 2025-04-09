// pages/provinceLine/provinceLine.js
const app = getApp();
const backendUrl = 'http://localhost:3001'; // 或全局获取

Page({
  data: {
    showPopup: false,
    selectedProvince: '北京', // 默认值
    selectedYear: 2022,    // 默认值
    // --- 用于 Picker 的数据 ---
    filterOptions: { // 从后端获取或预定义
        provinces: ['北京', '上海', '天津', '重庆', '河北', '山西', /* ...更多 */ '广东'],
        years: [2024, 2023, 2022, 2021, 2020] // 倒序
    },
    tempProvince: '北京', // 弹出层中临时选择
    tempYear: 2022,    // 弹出层中临时选择
    // --- 列表数据 ---
    controlLines: [],
    loading: true,
    error: null,
  },

  onLoad(options) {
    // 可选：页面加载时获取筛选选项
    // this.fetchFilterOptions();
    // 初始加载默认省份和年份的数据
    this.fetchControlLines();
  },

  // (可选) API 调用：获取筛选选项
  fetchFilterOptions() {
      wx.request({
          url: `${backendUrl}/api/data/filter-options`,
          success: (res) => {
              if(res.statusCode === 200 && res.data.code === 200) {
                  this.setData({ 'filterOptions.provinces': res.data.data.provinces, 'filterOptions.years': res.data.data.years });
              }
          },
          fail: (err) => console.error("获取筛选选项失败:", err)
      });
  },

  // API 调用：获取省控线数据
  fetchControlLines() {
    this.setData({ loading: true, error: null });
    const { selectedProvince, selectedYear } = this.data;
    console.log(`请求省控线: ${selectedProvince} ${selectedYear}`);
    wx.request({
      url: `${backendUrl}/api/data/control-lines`,
      data: {
        province: selectedProvince,
        year: selectedYear
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 200) {
          this.setData({ controlLines: res.data.data, loading: false });
        } else {
          this.setData({ loading: false, error: res.data.message || '加载失败', controlLines: [] });
        }
      },
      fail: (err) => {
        console.error("获取省控线接口失败:", err);
        this.setData({ loading: false, error: '网络错误，加载失败', controlLines: [] });
      }
    });
  },

  // --- 弹出层与筛选 ---
  showFilterPopup() {
    // 打开弹出层时，将当前选定值赋给临时变量
    this.setData({
        tempProvince: this.data.selectedProvince,
        tempYear: this.data.selectedYear,
        showPopup: true
     });
  },
  onClosePopup() {
    this.setData({ showPopup: false });
  },
  // (简化版) 弹出层中点击选项直接修改临时变量
   onProvinceSelect(event) {
       const province = event.currentTarget.dataset.province;
       this.setData({ tempProvince: province });
   },
   onYearSelect(event) {
       const year = event.currentTarget.dataset.year;
       this.setData({ tempYear: year });
   },
   // 点击确定按钮，应用筛选并重新加载数据
  confirmFilter() {
      this.setData({
          selectedProvince: this.data.tempProvince,
          selectedYear: this.data.tempYear,
          showPopup: false // 关闭弹出层
      });
      this.fetchControlLines(); // 重新加载数据
  },

  // (更佳方案) 使用 Picker 实现选择
  // onPickerChange(event) { ... }
});