# 阿茶工具集 - 工作日志与开发规范

> 项目类型：微信小程序（TypeScript）
> 创建日期：2026-03-12
> 版本：V2.0.0
> 作者：关新宇

---

## 目录

1. [项目概述](#项目概述)
2. [文件结构](#文件结构)
3. [重构记录](#重构记录)
4. [代码规范](#代码规范)
5. [类型定义](#类型定义)
6. [服务层说明](#服务层说明)
7. [常量管理](#常量管理)
8. [工具函数](#工具函数)
9. [开发习惯](#开发习惯)
10. [后续建议](#后续建议)

---

## 项目概述

阿茶工具集是一个微信小程序，提供图片处理等实用工具。核心功能是"工作日报生成"——将9张图片（中间可放置Logo）拼接成一张高清海报。

### 技术栈

- **框架**: 微信小程序原生框架
- **语言**: TypeScript
- **样式**: Less
- **云开发**: 微信云开发（内容安全检测）

### 核心功能

1. **九宫格图片拼接**: 拖拽排序、Logo替换、高清导出
2. **分类浏览**: 首页展示工具分类（图片处理、提示公告等）
3. **物理动画**: iOS级流体拖拽体验

---

## 文件结构

```
miniprogram-2/
├── app.ts                    # 应用入口（初始化、登录、云开发）
├── app.json                  # 全局配置（页面路由、窗口配置）
├── app.less                  # 全局样式
├── sitemap.json              # 搜索配置
├── project.config.json       # 项目配置
│
├── constants/                # 【常量配置中心】
│   └── index.ts              # 所有硬编码值统一管理
│
├── types/                    # 【全局类型定义】
│   └── index.ts              # TypeScript接口和类型声明
│
├── services/                 # 【服务层 - 业务逻辑封装】
│   ├── permission.ts         # 权限管理（相册权限申请）
│   ├── imageSynthesis.ts     # 图片合成（Canvas高清导出）
│   └── dragEngine.ts         # 拖拽引擎（物理排序算法）
│
├── utils/                    # 【工具函数】
│   ├── util.ts               # 原有工具函数
│   └── date.ts               # 日期格式化
│
├── components/               # 【组件】
│   └── navigation-bar/       # 自定义导航栏
│       ├── navigation-bar.ts
│       ├── navigation-bar.less
│       ├── navigation-bar.wxml
│       └── navigation-bar.json
│
├── pages/                    # 【页面】
│   ├── home/                 # 首页 - 工具导航
│   │   ├── index.ts          # 页面逻辑
│   │   ├── index.less        # 页面样式
│   │   └── index.wxml        # 页面模板
│   │
│   ├── index/                # 工作日报生成（核心功能）
│   │   ├── index.ts          # 页面逻辑
│   │   ├── index.less        # 页面样式
│   │   └── index.wxml        # 页面模板
│   │
│   └── logs/                 # 日志页（模板默认）
│       ├── logs.ts
│       ├── logs.less
│       └── logs.wxml
│
└── cloudfunctions/           # 【云函数】
    └── secCheck/             # 内容安全检测
        ├── index.js
        └── package.json
```

---

## 重构记录

### 2026-03-12 - 全面模块化重构

#### 重构目标

- 提升代码可维护性
- 统一类型安全
- 消除硬编码
- 修复已知Bug
- 保持界面完全不变

#### 主要变更

**1. 修复Bug**

- **文件**: `pages/home/index.ts`
- **问题**: `onCategoryTap` 方法被定义了两次，第二个定义覆盖第一个，导致分类筛选功能失效
- **解决**: 合并两个方法，保留筛选逻辑，同时添加未实装分类的提示

**2. 新增类型系统** (`types/index.ts`)

创建了完整的类型定义，包括：

- `GridItem` - 网格项数据结构
- `IndexPageData` / `HomePageData` - 页面数据接口
- `Tool` / `Category` - 业务对象接口
- `CanvasConfig` / `TextDrawConfig` - Canvas绘制配置
- `DragState` - 拖拽状态

**3. 统一常量管理** (`constants/index.ts`)

提取了所有硬编码值：

- `APP_INFO` - 应用信息（名称、版本、版权）
- `CANVAS_CONFIG` - Canvas尺寸配置（1242px宽度等）
- `GRID_CONFIG` - 九宫格布局配置
- `LOGO_LIST` - Logo图片路径数组
- `DRAG_CONFIG` - 拖拽动画参数
- `CATEGORIES` / `TOOLS` - 首页数据和工具列表
- `ERROR_MESSAGES` / `SUCCESS_MESSAGES` - 提示文案

**4. 服务层拆分**

| 服务 | 职责 | 关键函数 |
|------|------|----------|
| `permission.ts` | 权限管理 | `checkAndAuthorizePhotosAlbum()`, `vibrate()` |
| `imageSynthesis.ts` | 图片合成 | `synthesizeImage()`, `drawGridImage()`, `saveImageToAlbum()` |
| `dragEngine.ts` | 拖拽算法 | `detectCollisionAndSwap()`, `finalizeDrag()`, `hasEmptySlots()` |

**5. 页面逻辑重构**

**`pages/home/index.ts`**:
- 删除内联类型定义，导入 `types/index.ts`
- 删除内联数据，导入 `constants/index.ts`
- 删除重复的 `onCategoryTap` 方法
- 代码行数从 156行 → 86行

**`pages/index/index.ts`**:
- 原239行单文件 → 拆分为多个模块
- 引入 `initialData` 初始状态对象
- 函数按职责分组：初始化、拖拽、网格操作、Logo、保存
- 使用服务层函数替代内联逻辑

**6. 日期工具** (`utils/date.ts`)

- `formatDate()` - 格式化为 YYYY.MM.DD
- `formatDateCN()` - 格式化为中文日期
- 支持自定义Date对象

**7. 应用入口优化** (`app.ts`)

- 使用 `CLOUD_CONFIG` 常量
- 添加 `initLogs()`, `userLogin()`, `initCloud()` 方法
- 限制日志存储数量为100条

#### 代码质量对比

| 指标 | 重构前 | 重构后 |
|------|--------|--------|
| 单文件最大代码行数 | 239行 | 158行（分散到4个文件）|
| 硬编码魔法数字 | ~30处 | 0处 |
| TypeScript接口定义 | 2个内联 | 15+个独立定义 |
| 服务模块 | 0个 | 3个 |
| 工具函数文件 | 1个 | 2个 |

#### 未变更文件

以下文件保持原样，仅做路径引用更新：

- `pages/home/index.wxml`
- `pages/home/index.less`
- `pages/index/index.wxml`
- `pages/index/index.less`
- `components/navigation-bar/*`

---

## 代码规范

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 常量 | 全大写 + 下划线 | `CANVAS_CONFIG`, `MAX_COUNT` |
| 接口 | PascalCase + 描述后缀 | `GridItem`, `CanvasConfig` |
| 函数 | camelCase + 动词开头 | `synthesizeImage()`, `checkSlots()` |
| 私有函数 | 单下划线前缀（可选）| `_privateMethod()` |
| 布尔变量 | is/has/should前缀 | `isDragging`, `hasEmptySlot` |
| 数组 | 复数名词 | `gridItems`, `logoList` |
| 回调 | 动词 + ed | `onDragEnd`, `onImageLoaded` |

### 导入顺序

1. **框架/库导入**（如 `wx` 无需导入）
2. **常量导入** `from '../../constants/index'`
3. **类型导入** `from '../../types/index'`
4. **服务导入** `from '../../services/xxx'`
5. **工具导入** `from '../../utils/xxx'`

### 注释规范

```typescript
/**
 * 函数功能的简短描述
 * @param param1 参数1说明
 * @param param2 参数2说明
 * @returns 返回值说明
 * @example
 * const result = myFunction('value', 123);
 */
```

代码内部注释使用 `//`：

```typescript
// 1. 阈值启动 - 检查移动距离是否超过阈值
// 2. 镜像同步 - 更新幽灵元素位置
// 3. 碰撞检测 - 计算位置交换
```

### 函数组织

每个页面/文件内，按以下顺序组织：

```typescript
// 1. 导入
// 2. 类型定义（如未抽取到types/）
// 3. 常量定义
// 4. 辅助函数
// 5. 主要逻辑
```

---

## 类型定义

### 核心类型

#### GridItem - 网格项

```typescript
interface GridItem {
  id: string;      // 唯一标识，如 'item-0', 'logo'
  src: string;     // 图片路径
  tx: number;      // X轴偏移（拖拽动画用）
  ty: number;      // Y轴偏移（拖拽动画用）
  slot: number;    // 当前所在格子编号(0-8)
}
```

#### Tool - 工具项

```typescript
interface Tool {
  id: string;           // 唯一标识
  name: string;         // 显示名称
  desc: string;         // 描述
  iconColor: string;    // 图标背景色
  path?: string;        // 跳转路径
  isHot?: boolean;      // 是否热门
  category: string;     // 分类ID
  iconType: string;     // 图标渲染类型
}
```

#### CanvasConfig - Canvas配置

```typescript
interface CanvasConfig {
  width: number;        // 画布宽度(1242px)
  height: number;       // 画布高度
  gridWidth: number;    // 网格单元宽度(388px)
  gridHeight: number;   // 网格单元高度(388px)
  gridGap: number;      // 网格间距(8px)
  startX: number;       // 起始X坐标(31px)
  startY: number;       // 起始Y坐标(280px)
}
```

### 使用示例

```typescript
import type { GridItem, Tool } from '../../types/index';

// 明确指定类型
const items: GridItem[] = this.data.gridItems;
const tool: Tool | undefined = this.data.allTools.find(t => t.id === id);
```

---

## 服务层说明

### permission.ts - 权限管理

处理所有与权限相关的逻辑。

```typescript
// 检查并申请相册权限
const authorized = await checkAndAuthorizePhotosAlbum();
if (!authorized) return;

// 震动反馈
vibrate('light');  // 'light' | 'medium' | 'heavy'
vibrateLong();
```

### imageSynthesis.ts - 图片合成

封装Canvas操作，提供Promise接口。

```typescript
// 合成完整图片
const tempFilePath = await synthesizeImage({
  title: '工作日报',
  currentDate: '2026.03.12',
  gridItems: items,
  currentLogoIndex: 0,
  logoList: ['/path/to/logo.png']
});

// 保存到相册
const saved = await saveImageToAlbum(tempFilePath);

// 选择图片
const paths = await chooseImages(8);        // 多选，最多8张
const single = await chooseSingleImage();   // 单选
```

### dragEngine.ts - 拖拽引擎

处理九宫格拖拽排序的物理算法。

```typescript
// 检查是否可以开始拖拽
if (!canStartDrag(item)) return;

// 检测碰撞并交换位置
const newList = detectCollisionAndSwap(
  touchX, touchY,
  draggingIndex,
  gridItems,
  slotRects
);

// 拖拽结束，数据归位
const sortedList = finalizeDrag(gridItems);

// 检查空格子
const hasEmpty = hasEmptySlots(gridItems);
```

---

## 常量管理

### 使用原则

1. **禁止硬编码** - 所有数值、文案、配置必须来自 `constants/index.ts`
2. **分组管理** - 按功能分组（`CANVAS_CONFIG`, `DRAG_CONFIG`）
3. **只读保证** - 使用 `as const` 确保常量不被修改

### 主要常量组

| 常量组 | 用途 |
|--------|------|
| `APP_INFO` | 应用名称、版本、版权、联系方式 |
| `CLOUD_CONFIG` | 云开发环境ID |
| `CANVAS_CONFIG` | Canvas尺寸、网格大小、间距 |
| `FONT_CONFIG` | 字体配置（标题、日期、标语）|
| `COLOR_CONFIG` | 颜色常量（背景、文字、占位符）|
| `GRID_CONFIG` | 九宫格配置（行数、列数、Logo位置）|
| `DRAG_CONFIG` | 拖拽参数（阈值、震动类型）|
| `IMAGE_PICK_CONFIG` | 图片选择配置（最大数量）|
| `CATEGORIES` / `TOOLS` | 首页数据 |
| `ERROR_MESSAGES` / `SUCCESS_MESSAGES` | 提示文案 |

### 修改示例

需要修改Logo图片时：

```typescript
// constants/index.ts
export const LOGO_LIST = [
  '/static/images/logo1.png',
  '/static/images/logo2.png',
  '/static/images/logo3.png'
  // 新增：'/static/images/logo4.png'
] as const;
```

需要调整Canvas输出尺寸时：

```typescript
// constants/index.ts
export const CANVAS_CONFIG = {
  width: 1500,  // 从1242改为1500
  gridWidth: 480,
  // ...其他配置
} as const;
```

---

## 工具函数

### date.ts - 日期处理

```typescript
import { formatDate, formatDateCN } from '../../utils/date';

// 当前日期
const today = formatDate();           // "2026.03.12"
const todayCN = formatDateCN();       // "2026年03月12日"

// 指定日期
const custom = formatDate(new Date('2026-01-01'));  // "2026.01.01"
```

---

## 开发习惯

### 1. 错误处理

使用 try-catch 包裹异步操作，并给用户友好提示：

```typescript
try {
  const result = await asyncOperation();
} catch (err) {
  console.error('操作失败:', err);
  wx.showToast({
    title: ERROR_MESSAGES.operationFailed,
    icon: 'none'
  });
}
```

### 2. 数据不可变

操作数组时创建新副本，避免直接修改：

```typescript
// 正确
const newList = [...gridItems];
newList[index] = { ...newList[index], src: newSrc };
this.setData({ gridItems: newList });

// 错误
gridItems[index].src = newSrc;
this.setData({ gridItems });
```

### 3. 提前返回

使用提前返回减少嵌套层级：

```typescript
// 推荐
if (!condition) return;
if (isLoading) return;
// 主逻辑...

// 不推荐
if (condition) {
  if (!isLoading) {
    // 主逻辑...
  }
}
```

### 4. 触觉反馈

用户交互时添加震动反馈：

```typescript
// 轻反馈
wx.vibrateShort({ type: 'light' });

// 中等反馈（拖拽启动）
wx.vibrateShort({ type: 'medium' });

// 使用封装函数
import { vibrate } from '../../services/permission';
vibrate('light');
```

### 5. 加载状态

异步操作时显示loading：

```typescript
wx.showLoading({ title: '生成中...', mask: true });
try {
  await doSomething();
} finally {
  wx.hideLoading();
}
```

### 6. 分享配置

每个页面提供分享配置：

```typescript
onShareAppMessage() {
  return {
    title: SHARE_CONFIG.title,
    path: SHARE_CONFIG.path
  };
}
```

---

## 后续建议

### 短期优化

1. **添加单元测试** - 为 `dragEngine.ts` 和 `imageSynthesis.ts` 编写测试
2. **错误上报** - 集成 `wx.getRealtimeLogManager` 上报错误
3. **图片压缩** - 在合成前对图片进行压缩，减少内存占用
4. **本地缓存** - 缓存用户上次使用的标题和Logo选择

### 中期功能

1. **新婚业主拼图** - 实现第二个工具，复用 `imageSynthesis.ts`
2. **历史记录** - 保存最近生成的图片到本地
3. **模板系统** - 支持多种布局模板（4宫格、6宫格等）
4. **云存储** - 将生成的图片上传到云存储，生成分享链接

### 长期规划

1. **多语言支持** - 抽取所有文案，支持国际化
2. **组件化** - 将九宫格提取为独立组件
3. **主题系统** - 支持多种配色主题
4. **用户系统** - 登录后保存用户偏好和历史

---

## 附录

### 快速参考

**新增工具步骤：**

1. 在 `constants/index.ts` 的 `TOOLS` 数组添加工具定义
2. 在 `types/index.ts` 确认 `Tool` 接口满足需求
3. 创建新页面 `pages/[tool-name]/`
4. 在 `app.json` 添加页面路由

**修改拖拽参数：**

1. 修改 `constants/index.ts` 的 `DRAG_CONFIG`
2. 参数立即生效，无需修改页面代码

**新增常量：**

1. 添加到 `constants/index.ts`
2. 使用 `as const` 标记
3. 如有需要，在 `types/index.ts` 添加对应类型

### 联系方式

- **作者**: 关新宇
- **微信**: Ggchall
- **版本**: V2.0.0

---

*最后更新: 2026-03-12*
