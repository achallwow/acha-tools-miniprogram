// app.ts
import { IAppOption } from './types/index';

App<IAppOption>({
  globalData: {
    // a good place to store user info globally
    // userInfo: undefined
  },

  onLaunch() {
    // --- 1. 展示本地存储能力 ---
    const logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // --- 2. 用户登录 ---
    wx.login({
      success: res => {
        console.log('wx.login a success, code:', res.code);
        // 在这里，你应该将 res.code 发送到你的后端服务器
        // 以换取用户的 openId, sessionKey, unionId
        // e.g., request({ url: '/api/login', data: { code: res.code } })
      },
      fail: err => {
        console.error('wx.login failed:', err);
      }
    });

    // --- 3. 初始化云开发环境 ---
    if (!(wx as any).cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      (wx as any).cloud.init({
        // 你的云开发环境 ID
        env: 'cloudbase-4gvgujwp6c018b50',
        // 是否在将用户访问记录到用户管理中，在控制台中可见
        traceUser: true,
      });
    }
  },
});
