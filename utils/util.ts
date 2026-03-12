// utils/util.ts

/**
 * @description 检查并请求小程序的相册写入权限
 * @returns {Promise<boolean>} Promise a boolean value, true if authorized, false otherwise.
 */
export function checkAndRequestPhotosAlbumScope(): Promise<boolean> {
  return new Promise((resolve) => {
    wx.getSetting({
      success: (res) => {
        // Case 1: 用户从未授权过
        if (res.authSetting['scope.writePhotosAlbum'] === undefined) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => resolve(true), // 用户同意授权
            fail: () => resolve(false)    // 用户拒绝授权
          });
        } 
        // Case 2: 用户已拒绝过授权
        else if (res.authSetting['scope.writePhotosAlbum'] === false) {
          wx.showModal({
            title: '授权提示',
            content: '您需要授权相册写入权限才能保存图片，是否前往设置页开启？',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting({
                  success: (settingRes) => {
                    // 用户在设置页操作后，返回true如果权限已开启
                    resolve(!!settingRes.authSetting['scope.writePhotosAlbum']);
                  },
                  fail: () => resolve(false) // 打开设置页失败
                });
              } else {
                resolve(false); // 用户在弹窗中点击了“取消”
              }
            }
          });
        } 
        // Case 3: 用户已授权
        else {
          resolve(true);
        }
      },
      fail: () => resolve(false) // 获取设置失败
    });
  });
}
