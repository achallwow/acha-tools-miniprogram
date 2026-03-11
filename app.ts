// app.ts
App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log(res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })

    // 初始化云开发
    if (!(wx as any).cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      (wx as any).cloud.init({
        env: 'cloudbase-4gvgujwp6c018b50',
        traceUser: true,
      });
    }
  },
})