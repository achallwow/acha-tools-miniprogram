---
name: "vibe-coder-assistant"
description: "微信小程序 Vibe Coding 全能助手，集开发规范、代码生成、排错调试于一体。Invoke when user wants to create pages/components, generate code, fix errors, or needs any WeChat mini-program development help."
---

# Vibe Coder 全能助手

## 核心原则

**绝对禁止代码省略**：必须输出包含完整逻辑的、可直接复制运行的全部代码，绝对不可使用 `// ...此处省略` 或 `// 同上` 等占位符。

## 工作流

### 1. 需求理解 → 查阅规范 → 生成代码

```
用户提出需求
    ↓
分析需求类型（页面/组件/工具/调试）
    ↓
查阅对应规范模板
    ↓
生成完整可运行代码
    ↓
提供使用说明
```

## 一、开发规范（知识库）

### 项目结构
```
miniprogram/
├── components/          # 公共组件
├── pages/               # 页面
├── utils/               # 工具函数
├── types/               # 类型定义
├── services/            # API 服务
├── images/              # 图片资源
├── app.ts               # 应用入口
├── app.json             # 应用配置
├── app.less             # 全局样式
└── sitemap.json         # 站点地图
```

### 命名规范
- 页面/组件目录: 小写，短横线连接 (`user-profile`)
- TypeScript 文件: 小写 (`index.ts`)
- 组件/类名: PascalCase (`NavigationBar`)
- 函数/变量: camelCase (`getUserInfo`)
- 常量: UPPER_SNAKE_CASE (`MAX_COUNT`)
- 接口: 前缀 `I` (`IUserInfo`)

### 数据流向与状态管理

#### 全局状态
- 统一存放在 `app.ts` 的 `globalData` 中
- 通过 `getApp()` 访问和修改

```typescript
// app.ts
App({
  globalData: {
    userInfo: null as IUserInfo | null,
    isLogin: false,
    systemInfo: null as WechatMiniprogram.SystemInfo | null
  }
});

// 页面中使用
const app = getApp();
const userInfo = app.globalData.userInfo;
```

#### 页面间数据传递
- **简单数据**: URL 参数 (`options`)
- **复杂对象**: `wx.setStorageSync` / `wx.getStorageSync`
- **事件通信**: `EventChannel` (页面间事件)

```typescript
// 页面 A 跳转并传递数据
wx.navigateTo({
  url: '/pages/detail/index?id=123',
  success: (res) => {
    // 通过 EventChannel 传递复杂数据
    res.eventChannel.emit('acceptDataFromOpenerPage', { data: complexObject });
  }
});

// 页面 B 接收数据
onLoad(options) {
  // 简单数据从 options 获取
  const id = options.id;
  
  // 复杂数据从 EventChannel 获取
  const eventChannel = this.getOpenerEventChannel();
  eventChannel.on('acceptDataFromOpenerPage', (data) => {
    console.log(data);
  });
}
```

## 二、代码生成（执行动作）

### 页面生成

**输入**: 页面名称、功能描述
**输出**: 完整的页面目录和文件

#### TypeScript 模板
```typescript
// pages/<page-name>/index.ts
interface IPageData {
  title: string;
  loading: boolean;
  error: string | null;
}

Page<IPageData>({
  data: {
    title: '',
    loading: false,
    error: null
  },

  onLoad(options: Record<string, string>) {
    console.log('页面加载，参数:', options);
    this.initData();
  },

  onReady() {
    console.log('页面初次渲染完成');
  },

  onShow() {
    console.log('页面显示');
  },

  onHide() {
    console.log('页面隐藏');
  },

  onUnload() {
    console.log('页面卸载');
  },

  onPullDownRefresh() {
    console.log('下拉刷新');
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    console.log('上拉加载更多');
  },

  // 初始化数据
  async initData() {
    this.setData({ loading: true, error: null });
    try {
      // 数据加载逻辑
      this.setData({ loading: false });
    } catch (err) {
      this.setData({ 
        loading: false, 
        error: err instanceof Error ? err.message : '加载失败' 
      });
    }
  },

  // 处理点击事件
  handleTap(event: WechatMiniprogram.TouchEvent) {
    console.log('点击事件:', event);
  }
});
```

#### WXML 模板
```xml
<!-- pages/<page-name>/index.wxml -->
<view class="container">
  <!-- 加载状态 -->
  <view wx:if="{{loading}}" class="loading">
    <text>加载中...</text>
  </view>
  
  <!-- 错误状态 -->
  <view wx:elif="{{error}}" class="error">
    <text>{{error}}</text>
    <button bindtap="initData">重试</button>
  </view>
  
  <!-- 内容区域 -->
  <view wx:else class="content">
    <text class="title">{{title}}</text>
  </view>
</view>
```

#### Less 模板
```less
/* pages/<page-name>/index.less */
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200rpx;
    
    text {
      color: #999;
      font-size: 28rpx;
    }
  }
  
  .error {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 400rpx;
    padding: 40rpx;
    
    text {
      color: #ff4d4f;
      font-size: 28rpx;
      margin-bottom: 20rpx;
    }
    
    button {
      width: 200rpx;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      background-color: #1890ff;
      color: #fff;
      border-radius: 8rpx;
    }
  }
  
  .content {
    padding: 20rpx;
    
    .title {
      font-size: 32rpx;
      color: #333;
      font-weight: bold;
    }
  }
}
```

#### JSON 模板
```json
{
  "usingComponents": {},
  "navigationBarTitleText": "页面标题",
  "enablePullDownRefresh": true,
  "backgroundColor": "#f5f5f5"
}
```

### 组件生成

#### Component 模板
```typescript
// components/<component-name>/index.ts
interface IComponentData {
  internalData: string;
}

Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    size: {
      type: String,
      value: 'default' // default, small, large
    },
    disabled: {
      type: Boolean,
      value: false
    }
  },

  data: {
    internalData: ''
  } as IComponentData,

  lifetimes: {
    attached() {
      console.log('组件 attached');
    },
    
    detached() {
      console.log('组件 detached');
    }
  },

  methods: {
    handleTap(event: WechatMiniprogram.TouchEvent) {
      if (this.data.disabled) return;
      
      this.triggerEvent('tap', { 
        data: this.data.internalData,
        timestamp: Date.now()
      });
    }
  }
});
```

### API 请求封装（完整版）

```typescript
// services/request.ts

// 基础配置
const BASE_URL = 'https://api.example.com';
const TIMEOUT = 10000;

// 请求配置接口
interface IRequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: Record<string, any>;
  params?: Record<string, any>;
  header?: Record<string, string>;
  showLoading?: boolean;
  loadingText?: string;
}

// 响应数据接口
interface IResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 获取 Token
function getToken(): string {
  return wx.getStorageSync('token') || '';
}

// 请求拦截
function requestInterceptor(config: IRequestConfig): IRequestConfig {
  const token = getToken();
  
  return {
    ...config,
    header: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...config.header
    }
  };
}

// 响应拦截
function responseInterceptor<T>(response: WechatMiniprogram.RequestSuccessCallbackResult): IResponse<T> {
  const data = response.data as IResponse<T>;
  
  // 统一错误处理
  if (data.code !== 200) {
    wx.showToast({
      title: data.message || '请求失败',
      icon: 'none'
    });
    
    // Token 过期处理
    if (data.code === 401) {
      wx.removeStorageSync('token');
      wx.navigateTo({ url: '/pages/login/index' });
    }
    
    throw new Error(data.message);
  }
  
  return data;
}

// 统一请求方法
export function request<T = any>(config: IRequestConfig): Promise<T> {
  return new Promise((resolve, reject) => {
    // 显示加载
    if (config.showLoading !== false) {
      wx.showLoading({
        title: config.loadingText || '加载中...',
        mask: true
      });
    }
    
    // 处理 URL 参数
    let url = config.url;
    if (config.params) {
      const queryString = Object.entries(config.params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
    
    // 应用请求拦截
    const finalConfig = requestInterceptor(config);
    
    wx.request({
      url: `${BASE_URL}${url}`,
      method: finalConfig.method || 'GET',
      data: finalConfig.data,
      header: finalConfig.header,
      timeout: TIMEOUT,
      success: (res) => {
        try {
          const data = responseInterceptor<T>(res);
          resolve(data.data);
        } catch (err) {
          reject(err);
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        reject(err);
      },
      complete: () => {
        // 隐藏加载
        if (config.showLoading !== false) {
          wx.hideLoading();
        }
      }
    });
  });
}

// 便捷方法
export const http = {
  get: <T>(url: string, params?: Record<string, any>, config?: Partial<IRequestConfig>) => 
    request<T>({ url, method: 'GET', params, ...config }),
  
  post: <T>(url: string, data?: Record<string, any>, config?: Partial<IRequestConfig>) => 
    request<T>({ url, method: 'POST', data, ...config }),
  
  put: <T>(url: string, data?: Record<string, any>, config?: Partial<IRequestConfig>) => 
    request<T>({ url, method: 'PUT', data, ...config }),
  
  delete: <T>(url: string, params?: Record<string, any>, config?: Partial<IRequestConfig>) => 
    request<T>({ url, method: 'DELETE', params, ...config })
};
```

## 三、排错与调试工作流

### 当用户遇到错误时，按以下步骤处理：

#### 步骤 1: 分析报错信息
- 识别错误类型（语法错误、运行时错误、API 错误）
- 定位错误发生的文件和行号
- 理解错误信息的含义

#### 步骤 2: 常见错误检查清单

**A. app.json 配置错误**
- 检查页面路径是否正确
- 检查 usingComponents 路径是否正确
- 检查 tabBar 配置是否完整

**B. WXML 数据绑定错误**
- 检查 `{{}}` 中的变量名是否正确
- 检查 wx:if/wx:for 的表达式是否正确
- 检查事件绑定函数名是否存在

**C. TypeScript 类型错误**
- 检查接口定义是否完整
- 检查变量类型是否匹配
- 检查函数参数和返回值类型

**D. 生命周期错误**
- 检查 onLoad/onShow 中的异步操作
- 检查 setData 的数据格式
- 检查组件的 properties 定义

#### 步骤 3: 提供修复方案
- 给出完整的修复代码
- 解释错误原因
- 提供预防措施

### 调试技巧

```typescript
// 开启调试模式
wx.setEnableDebug({
  enableDebug: true
});

// 日志分级
const logger = {
  debug: (msg: string, ...args: any[]) => console.debug(`[DEBUG] ${msg}`, ...args),
  info: (msg: string, ...args: any[]) => console.info(`[INFO] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args)
};

// 性能监控
const perf = {
  start: (label: string) => console.time(label),
  end: (label: string) => console.timeEnd(label)
};
```

## 四、类型定义模板

```typescript
// types/index.ts

// 用户信息
export interface IUserInfo {
  id: number;
  nickname: string;
  avatarUrl: string;
  phone?: string;
  createTime: string;
  updateTime: string;
}

// 分页数据
export interface IPagination<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// API 响应
export interface IApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 页面数据通用结构
export interface IPageState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
```

## 五、工具函数库

```typescript
// utils/index.ts

/**
 * 格式化日期
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number = 300
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  
  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      cloned[key as keyof T] = deepClone(obj[key as keyof T]);
    });
    return cloned;
  }
  return obj;
}

/**
 * 显示提示
 */
export function showToast(title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none') {
  wx.showToast({
    title,
    icon,
    duration: 2000
  });
}

/**
 * 确认对话框
 */
export function showConfirm(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm)
    });
  });
}
```
