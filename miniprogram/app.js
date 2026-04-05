App({
  globalData: {
    env: "zuogelvyougonglue-7eo8va563e4709",
    cloudInitialized: false,
    cloudAvailable: false
  },
  
  onLaunch() {
    console.log('开始初始化云开发...');
    
    // 检查 wx.cloud 是否存在
    if (!wx.cloud) {
      console.error('云开发不可用，请检查基础库版本');
      this.globalData.cloudAvailable = false;
      return;
    }
    
    this.globalData.cloudAvailable = true;
    console.log('马上开始初始化云开发...');
    
    // 初始化云开发
    wx.cloud.init({
      env: this.globalData.env,
      traceUser: true,
      success: () => {
        console.log('云开发初始化成功');
        this.globalData.cloudInitialized = true;
      },
      fail: (err) => {
        console.error('云开发初始化失败:', err);
        this.globalData.cloudInitialized = false;
      }
    });
  }
});