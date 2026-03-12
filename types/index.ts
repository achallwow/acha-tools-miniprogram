// types/index.ts

/**
 * 全局 App 实例的类型选项
 */
export interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}

/**
 * 首页（pages/home/index）分类矩阵的条目类型
 */
export interface ICategory {
  id: string;
  name: string;
  iconClass: string;
}

/**
 * 首页（pages/home/index）工具列表的条目类型
 */
export interface ITool {
  id: string;
  name: string;
  desc: string;
  iconColor: string;
  path?: string; // 跳转路径，可选
  isHot?: boolean; // 是否热门，可选
  category: string; // 归属的分类ID
  iconType: string; // 图标渲染类型，用于展示不同样式的图标
}

/**
 * 九宫格页面（pages/index/index）的网格项类型
 */
export interface IGridItem {
  id: string; // 唯一标识，如 'item-0', 'logo'
  src: string; // 图片路径
  tx: number;  // X轴方向的视觉偏移量 (translate X)
  ty: number;  // Y轴方向的视觉偏移量 (translate Y)
  slot: number; // 逻辑坑位编号 (0-8)
}

/**
 * 微信小程序 SelectorQuery API 的 BoundingClientRect 查询结果类型
 */
export interface IRect {
  bottom: number;
  dataset: object;
  height: number;
  id: string;
  left: number;
  right: number;
  top: number;
  width: number;
}
