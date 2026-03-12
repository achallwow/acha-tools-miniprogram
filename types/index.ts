/**
 * 全局类型定义
 * 阿茶工具集 - TypeScript类型声明
 */

// ==================== 通用类型 ====================

/** 网格项数据 */
export interface GridItem {
  id: string;
  src: string;
  tx: number;
  ty: number;
  slot: number;
}

/** Logo配置 */
export interface LogoConfig {
  list: string[];
  defaultIndex: number;
}

// ==================== 页面数据类型 ====================

/** 首页分类 */
export interface Category {
  id: string;
  name: string;
  iconClass: string;
}

/** 工具项 */
export interface Tool {
  id: string;
  name: string;
  desc: string;
  iconColor: string;
  path?: string;
  isHot?: boolean;
  category: string;
  iconType: string;
}

/** Index页面数据 */
export interface IndexPageData {
  // 标题相关
  title: string;
  currentDate: string;

  // Logo相关
  logoList: string[];
  currentLogoIndex: number;
  showLogoPicker: boolean;

  // 网格相关
  gridItems: GridItem[];
  gridSlots: number[];

  // 拖拽状态
  isDragging: boolean;
  dragId: string;
  dragSrc: string;
  dragX: number;
  dragY: number;
  hasEmptySlot: boolean;
}

/** Home页面数据 */
export interface HomePageData {
  categories: Category[];
  allTools: Tool[];
  recentTools: Tool[];
  showAllTools: boolean;
  activeCategory?: string;
}

// ==================== Canvas配置类型 ====================

/** Canvas合成配置 */
export interface CanvasConfig {
  /** 画布宽度 */
  width: number;
  /** 画布高度 */
  height: number;
  /** 网格单元宽度 */
  gridWidth: number;
  /** 网格单元高度 */
  gridHeight: number;
  /** 网格间距 */
  gridGap: number;
  /** 网格起始X坐标 */
  startX: number;
  /** 网格起始Y坐标 */
  startY: number;
  /** 底部留白高度 */
  bottomPadding: number;
}

/** 文本绘制配置 */
export interface TextDrawConfig {
  text: string;
  font: string;
  color: string;
  y: number;
  letterSpacing?: number;
}

/** 图片绘制配置 */
export interface ImageDrawConfig {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  aspectRatio?: number;
}

// ==================== 拖拽引擎类型 ====================

/** 拖拽状态 */
export interface DragState {
  draggingIndex: number;
  ghostX: number;
  ghostY: number;
  ghostSrc: string;
  touchStartX: number;
  touchStartY: number;
  isActuallyDragging: boolean;
}

/** 拖拽事件数据 */
export interface DragEventData {
  clientX: number;
  clientY: number;
}

/** 网格位置 */
export interface GridPosition {
  index: number;
  rect: WechatMiniprogram.BoundingClientRectCallbackResult;
}

// ==================== 云函数类型 ====================

/** 云开发配置 */
export interface CloudConfig {
  env: string;
  traceUser: boolean;
}

/** 安全检测结果 */
export interface SecCheckResult {
  valid: boolean;
  message?: string;
}

// ==================== 导航栏组件类型 ====================

/** 导航栏属性 */
export interface NavigationBarProps {
  extClass?: string;
  title?: string;
  background?: string;
  color?: string;
  back?: boolean;
  loading?: boolean;
  homeButton?: boolean;
  animated?: boolean;
  show?: boolean;
  delta?: number;
}

/** 导航栏数据 */
export interface NavigationBarData extends NavigationBarProps {
  ios: boolean;
  innerPaddingRight: string;
  leftWidth: string;
  safeAreaTop: string;
  displayStyle: string;
}

// ==================== 工具函数返回类型 ====================

/** 相册权限检查结果 */
export interface AlbumAuthResult {
  authorized: boolean;
  error?: string;
}

/** 图片选择结果 */
export interface ImagePickResult {
  paths: string[];
  canceled?: boolean;
  error?: string;
}

/** 图片信息 */
export interface ImageInfo {
  path: string;
  width: number;
  height: number;
  size: number;
  type: string;
}

/** 图片合成参数 */
export interface SynthesisParams {
  title: string;
  currentDate: string;
  gridItems: GridItem[];
  currentLogoIndex: number;
  logoList: string[];
}

/** Canvas上下文 */
export interface CanvasContext {
  canvas: any;
  ctx: any;
  width: number;
  height: number;
}

/** 模板数据 */
export interface TemplateData {
  title: string;
  currentLogoIndex: number;
  savedAt: number;
}

/** 图片保存结果 */
export interface ImageSaveResult {
  success: boolean;
  filePath?: string;
  error?: string;
}
