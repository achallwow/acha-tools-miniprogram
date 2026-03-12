/**
 * 权限管理服务
 * 统一处理相册权限申请和检查
 */

import { ERROR_MESSAGES } from '../constants/index';

/**
 * 检查并申请相册写入权限
 * @returns Promise<boolean> 是否获得授权
 */
export function checkAndAuthorizePhotosAlbum(): Promise<boolean> {
  return new Promise((resolve) => {
    wx.getSetting({
      success: (res) => {
        const writePhotosSetting = res.authSetting['scope.writePhotosAlbum'];

        // 未申请过权限
        if (writePhotosSetting === undefined) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => resolve(true),
            fail: () => resolve(false)
          });
          return;
        }

        // 已被拒绝，需要引导去设置页
        if (writePhotosSetting === false) {
          wx.showModal({
            title: '提示',
            content: '需要相册权限才能保存图片',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting({
                  success: (settingRes) => {
                    resolve(!!settingRes.authSetting['scope.writePhotosAlbum']);
                  },
                  fail: () => resolve(false)
                });
              } else {
                resolve(false);
              }
            }
          });
          return;
        }

        // 已有权限
        resolve(true);
      },
      fail: () => resolve(false)
    });
  });
}

/**
 * 检查是否有相册权限（不主动申请）
 * @returns Promise<boolean>
 */
export function checkPhotosAlbumPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    wx.getSetting({
      success: (res) => {
        resolve(res.authSetting['scope.writePhotosAlbum'] === true);
      },
      fail: () => resolve(false)
    });
  });
}

/**
 * 打开设置页面引导用户授权
 * @returns Promise<boolean> 用户是否在设置页授予了权限
 */
export function openSettingForPhotos(): Promise<boolean> {
  return new Promise((resolve) => {
    wx.showModal({
      title: '需要权限',
      content: '请授权访问相册以保存图片',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({
            success: (settingRes) => {
              resolve(!!settingRes.authSetting['scope.writePhotosAlbum']);
            },
            fail: () => resolve(false)
          });
        } else {
          resolve(false);
        }
      }
    });
  });
}

/**
 * 请求震动反馈权限（小程序自动处理，不需要显式申请）
 * @param type 震动类型: 'light' | 'medium' | 'heavy'
 */
export function vibrate(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  wx.vibrateShort({ type });
}

/**
 * 长震动反馈
 */
export function vibrateLong(): void {
  wx.vibrateLong();
}
