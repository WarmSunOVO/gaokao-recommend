// pages/scoreRank.js
const app = getApp();
// !! 修改为你的实际后端地址
const backendUrl = app.globalData.backendUrl || 'https://localhost'; // 或 http://localhost:3001

Page({
  data: {
    showPopup: false,
    selectedProvince: '北京', // 默认值
    selectedYear: 2022,    // 默认值
    // --- 用于 Picker 的原始数据 ---
    filterOptions: {
        // 推荐从后端动态获取，这里用静态数据示例
        provinces: ['北京', '上海', '广东', '山东', '福建', '天津', '重庆', '河北', '山西'],
        years: [2024, 2023, 2022, 2021, 2020, 2019] // 数字类型
    },
    // --- Picker 组件需要的数据格式 ---
    filterColumns: [], // Picker 的列数据
    defaultPickerIndices: [0, 0], // Picker 打开时默认选中的索引 [省份索引, 年份索引]
    // --- 列表数据 ---
    scoreRankData: [],
    loading: true,
    error: null,
  },

  onLoad(options) {
    // 1. 准备 Picker 需要的列数据
    this.preparePickerColumns();
    // 2. 加载默认数据
    this.fetchScoreRank();
    // 3. (可选) 动态获取筛选选项并更新 Picker
    // this.fetchFilterOptions();
  },

  // 下拉刷新
  onPullDownRefresh() {
      console.log("Triggering pull down refresh for scoreRank");
      this.fetchScoreRank().finally(() => {
          wx.stopPullDownRefresh();
      });
  },

  // 将 filterOptions 转换为 Picker 需要的 columns 格式，并更新默认索引
  preparePickerColumns() {
    const { provinces, years } = this.data.filterOptions;
    if (!provinces || !years) return;

    const provinceColumn = {
        values: provinces.map(p => ({ text: p, value: p })),
    };
    const yearColumn = {
        values: years.map(y => ({ text: `${y}年`, value: y })),
    };

    // 计算当前选中项的索引
    const provinceIndex = provinces.findIndex(p => p === this.data.selectedProvince);
    const yearIndex = years.findIndex(y => y === this.data.selectedYear);

    this.setData({
      filterColumns: [provinceColumn, yearColumn],
      defaultPickerIndices: [ // 更新默认索引
          provinceIndex >= 0 ? provinceIndex : 0,
          yearIndex >= 0 ? yearIndex : 0
      ]
    });
  },

  // (可选) API 调用：获取筛选选项
  async fetchFilterOptions() {
     console.log("Fetching filter options...");
     try {
         const res = await new Promise((resolve, reject) => { wx.request({ url: `${backendUrl}/api/data/filter-options`, success: resolve, fail: reject }); });
         if(res.statusCode === 200 && res.data.code === 200) {
             this.setData({
                 'filterOptions.provinces': res.data.data.provinces.sort(),
                 'filterOptions.years': res.data.data.years.sort((a,b)=> b-a)
              }, () => { this.preparePickerColumns(); }); // 获取后重新准备 Picker 数据
         } else { console.error("获取筛选选项失败:", res); }
     } catch(err) { console.error("请求筛选选项接口失败:", err); }
  },

  // API 调用：获取一分一段数据
  async fetchScoreRank() {
    this.setData({ loading: true, error: null, scoreRankData: [] });
    const { selectedProvince, selectedYear } = this.data;
    console.log(`请求一分一段表: ${selectedProvince} ${selectedYear}`);
    try {
      const res = await new Promise((resolve, reject) => { wx.request({ url: `${backendUrl}/api/data/score-rank`, data: { province: selectedProvince, year: selectedYear }, success: resolve, fail: reject }); });
      if (res.statusCode === 200 && res.data.code === 200) {
        this.setData({ scoreRankData: res.data.data || [], loading: false });
      } else { this.setData({ loading: false, error: res.data.message || '加载失败', scoreRankData: [] }); }
    } catch (err) { this.setData({ loading: false, error: '网络错误，加载失败', scoreRankData: [] }); }
  },

  // --- 弹出层与 Picker 事件处理 ---
  showFilterPopup() {
    // 在显示前确保 Picker 的默认索引是最新的
    this.preparePickerColumns(); // 调用此方法会更新 defaultPickerIndices
    this.setData({ showPopup: true });
  },

  onClosePopup() {
    this.setData({ showPopup: false });
  },

  // 点击 Picker 的 "确认" 按钮时触发
  confirmFilterPicker(event) {
      const { value } = event.detail; // value 是选中项的对象数组
      const newProvince = value[0]?.value;
      const newYear = value[1]?.value;

      if (!newProvince || !newYear) return; // 防止意外

      console.log('Picker confirmed:', newProvince, newYear);

      // 更新选择并重新加载数据
      if (newProvince !== this.data.selectedProvince || newYear !== this.data.selectedYear) {
          this.setData({
              selectedProvince: newProvince,
              selectedYear: newYear,
          });
          this.fetchScoreRank(); // 重新加载数据
      }
       this.setData({ showPopup: false }); // 关闭弹出层
  },
});