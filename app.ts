// app.ts
// 应用入口

import { CLOUD_CONFIG } from './constants/index';

interface GlobalData {
  userInfo?: WechatMiniprogram.UserInfo;
}

interface AppOption {
  globalData: GlobalData;
  onLaunch: () => void;
}

App<AppOption>({
  globalData: {},

  onLaunch() {
    // 初始化日志存储
    this.initLogs();

    // 用户登录
    this.userLogin();

    // 初始化云开发
    this.initCloud();
  },

  /**
   * 初始化日志存储
   */
  initLogs() {
    const logs = wx.getStorageSync<string[]>('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs.slice(0, 100)); // 只保留最近100条
  },

  /**
   * 用户登录
   */
  userLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('登录成功，code:', res.code);
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
        }
      },
      fail: (err) => {
        console.error('登录失败:', err);
      }
    });
  },

  /**
   * 初始化云开发
   */
  initCloud() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    wx.cloud.init({
      env: CLOUD_CONFIG.env,
      traceUser: CLOUD_CONFIG.traceUser
    });

    console.log('云开发初始化完成');
  }
});
