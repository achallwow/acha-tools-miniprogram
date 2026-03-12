/**
 * 全局常量配置
 * 阿茶工具集 - 所有硬编码值统一管理
 */

// ==================== 应用配置 ====================

/** 应用信息 */
export const APP_INFO = {
  name: '阿茶工具集',
  version: 'V2.0.0',
  author: '关新宇',
  contact: 'Ggchall',
  copyright: '© 2026 关新宇',
  slogan: '专注您的生活'
} as const;

/** 分享配置 */
export const SHARE_CONFIG = {
  title: '阿茶工具集',
  path: '/pages/home/index'
} as const;

// ==================== 云开发配置 ====================

/** 云开发环境配置 */
export const CLOUD_CONFIG = {
  env: 'aicha-tools-7g4s8t7n8e8e4f50',
  traceUser: true
} as const;

// ==================== 画布合成配置 ====================

/** Canvas画布配置 - 高清输出尺寸 */
export const CANVAS_CONFIG = {
  /** 画布宽度（像素） */
  width: 1242,
  /** 网格单元宽度 */
  gridWidth: 388,
  /** 网格单元高度 */
  gridHeight: 388,
  /** 网格间距 */
  gridGap: 8,
  /** 网格起始X坐标 */
  startX: 31,
  /** 网格起始Y坐标 */
  startY: 280,
  /** 底部留白高度 */
  bottomPadding: 200
} as const;

/** 字体配置 */
export const FONT_CONFIG = {
  /** 标题字体 */
  title: 'bold 72px sans-serif',
  /** 日期字体 */
  date: 'bold 36px sans-serif',
  /** 标语文体 */
  slogan: 'bold 32px sans-serif'
} as const;

/** 颜色配置 */
export const COLOR_CONFIG = {
  /** 画布背景色 */
  background: '#ffffff',
  /** 标题颜色 */
  title: '#222222',
  /** 日期颜色 */
  date: '#666666',
  /** 网格占位符颜色 */
  gridPlaceholder: '#f8f8f8'
} as const;

/** 文本位置配置 */
export const TEXT_POSITION = {
  /** 标题Y坐标 */
  titleY: 100,
  /** 日期Y坐标 */
  dateY: 200,
  /** 标语Y偏移（从底部计算） */
  sloganOffset: 125,
  /** 标题字间距 */
  titleLetterSpacing: 10,
  /** 日期字间距 */
  dateLetterSpacing: 10,
  /** 标语文间距 */
  sloganLetterSpacing: 70
} as const;

// ==================== 网格布局配置 ====================

/** 九宫格配置 */
export const GRID_CONFIG = {
  /** 总行数 */
  rows: 3,
  /** 总列数 */
  cols: 3,
  /** 总格子数 */
  total: 9,
  /** Logo位置索引（中间） */
  logoIndex: 4,
  /** 可填充的图片格子数 */
  imageSlots: 8
} as const;

/** 网格项初始数据 */
export const INITIAL_GRID_ITEMS = [
  { id: 'item-0', src: '', tx: 0, ty: 0, slot: 0 },
  { id: 'item-1', src: '', tx: 0, ty: 0, slot: 1 },
  { id: 'item-2', src: '', tx: 0, ty: 0, slot: 2 },
  { id: 'item-3', src: '', tx: 0, ty: 0, slot: 3 },
  { id: 'logo', src: '', tx: 0, ty: 0, slot: 4 },
  { id: 'item-5', src: '', tx: 0, ty: 0, slot: 5 },
  { id: 'item-6', src: '', tx: 0, ty: 0, slot: 6 },
  { id: 'item-7', src: '', tx: 0, ty: 0, slot: 7 },
  { id: 'item-8', src: '', tx: 0, ty: 0, slot: 8 }
] as const;

// ==================== Logo配置 ====================

/** Logo图片列表 */
export const LOGO_LIST = [
  '/static/images/logo1.png',
  '/static/images/logo2.png',
  '/static/images/logo3.png'
] as const;

/** 默认选中Logo索引，-1表示未选择 */
export const DEFAULT_LOGO_INDEX = -1;

// ==================== 拖拽配置 ====================

/** 拖拽动画配置 */
export const DRAG_CONFIG = {
  /** 拖拽启动阈值（像素） */
  startThreshold: 15,
  /** 幽灵元素宽度（像素，设计稿换算） */
  ghostSize: 50,
  /** 拖拽启动震动类型 */
  startVibrateType: 'medium' as const,
  /** 碰撞震动类型 */
  collideVibrateType: 'light' as const
} as const;

// ==================== 图片选择配置 ====================

/** 图片选择配置 */
export const IMAGE_PICK_CONFIG = {
  /** 单次选择最大数量 */
  maxCount: 8,
  /** 图片类型 */
  mediaType: ['image'] as const
} as const;

// ==================== 首页配置 ====================

/** 分类列表 */
export const CATEGORIES = [
  { id: 'img', name: '图片处理', iconClass: 'icon-img' },
  { id: 'text', name: '提示公告', iconClass: 'icon-text' },
  { id: 'color', name: '还没做好', iconClass: 'icon-color' },
  { id: 'layout', name: '还没做好', iconClass: 'icon-layout' }
] as const;

/** 工具列表 */
export const TOOLS = [
  {
    id: 'grid-poster',
    name: '工作日报生成',
    desc: '上传现场工作照，自动生成工作日报！',
    iconColor: '#F2F2F7',
    path: '/pages/index/index',
    category: 'img',
    iconType: 'grid'
  },
  {
    id: 'newlywed-collage',
    name: '新婚业主拼图',
    desc: '上传新婚照片，自动生成拼图！',
    iconColor: '#F2F2F7',
    category: 'img',
    iconType: 'img'
  },
  {
    id: 'color-palette',
    name: '神秘新功能',
    desc: '更多实用的新功能开发中，请不要期待！',
    iconColor: '#F2F2F7',
    category: 'text',
    iconType: 'mystery'
  },
  {
    id: 'qr-beautify',
    name: '神秘新功能',
    desc: '更多实用的新功能开发中，请不要期待！',
    iconColor: '#F2F2F7',
    category: 'layout',
    iconType: 'mystery'
  },
  {
    id: 'mystery-tool',
    name: '神秘新功能',
    desc: '更多实用的新功能开发中，请不要期待！',
    iconColor: '#F2F2F7',
    category: 'color',
    iconType: 'mystery'
  }
] as const;

/** 工具列表显示配置 */
export const TOOL_LIST_CONFIG = {
  /** 默认显示数量 */
  defaultShowCount: 4
} as const;

// ==================== 动画/过渡配置 ====================

/** 滚动动画配置 */
export const SCROLL_CONFIG = {
  /** 滚动动画时长 */
  duration: 400
} as const;

/** 延迟配置 */
export const DELAY_CONFIG = {
  /** 初始获取布局信息延迟 */
  slotRectInitDelay: 1500,
  /** Canvas生成延迟 */
  canvasExportDelay: 100
} as const;

// ==================== 错误提示配置 ====================

/** 错误提示消息 */
export const ERROR_MESSAGES = {
  canvasError: 'Canvas初始化失败',
  emptySlots: '请填满空格',
  saveFailed: '保存失败',
  synthesisFailed: '合成失败',
  permissionDenied: '权限被拒绝'
} as const;

/** 成功提示消息 */
export const SUCCESS_MESSAGES = {
  saved: '已保存'
} as const;

// ==================== 加载提示配置 ====================

/** 加载状态提示 */
export const LOADING_MESSAGES = {
  generating: '生成中...'
} as const;

// ==================== 提示语配置 ====================

/** 通用提示语 */
export const TOAST_MESSAGES = {
  comingSoon: '即将上线，敬请期待',
  developing: '开发中',
  selectImages: '多选图片'
} as const;
