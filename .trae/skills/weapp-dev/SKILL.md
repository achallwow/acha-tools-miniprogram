---
name: "weapp-dev"
description: "微信小程序开发助手，提供页面/组件创建、代码生成、API封装等支持。Invoke when user wants to create WeChat mini-program pages, components, or needs help with WeChat APIs."
---

# 微信小程序开发助手

## 功能概述

本 Skill 专注于微信小程序原生开发，提供标准化的代码生成和开发指导。

## 使用场景

1. **创建新页面**: 生成完整的页面目录结构（ts/less/wxml/json）
2. **创建组件**: 生成可复用的自定义组件
3. **API 封装**: 统一封装微信 API 调用
4. **代码规范**: 确保代码符合项目规范

## 页面创建模板

### 目录结构
```
pages/<page-name>/
├── index.ts      # 页面逻辑
├── index.less    # 页面样式
├── index.wxml    # 页面模板
└── index.json    # 页面配置
```

### TypeScript 模板
```typescript
// pages/<page-name>/index.ts
Page({
  data: {
    // 页面数据
  },

  onLoad() {
    // 页面加载
  },

  onReady() {
    // 页面初次渲染完成
  },

  onShow() {
    // 页面显示
  },

  onHide() {
    // 页面隐藏
  },

  onUnload() {
    // 页面卸载
  },

  // 自定义方法
  handleTap() {
    // 处理点击事件
  }
});
```

### WXML 模板
```xml
<!-- pages/<page-name>/index.wxml -->
<view class="container">
  <text class="title">{{title}}</text>
</view>
```

### Less 模板
```less
/* pages/<page-name>/index.less */
.container {
  padding: 20rpx;
  
  .title {
    font-size: 32rpx;
    color: #333;
  }
}
```

### JSON 模板
```json
{
  "usingComponents": {},
  "navigationBarTitleText": "页面标题"
}
```

## 组件创建模板

### 目录结构
```
components/<component-name>/
├── index.ts
├── index.less
├── index.wxml
└── index.json
```

### Component 模板
```typescript
// components/<component-name>/index.ts
Component({
  properties: {
    // 组件属性
    title: {
      type: String,
      value: ''
    }
  },

  data: {
    // 组件内部数据
  },

  methods: {
    // 组件方法
    handleTap() {
      this.triggerEvent('tap', { data: 'value' });
    }
  }
});
```

## API 封装规范

### 请求封装
```typescript
// utils/request.ts
interface IRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: Record<string, any>;
  header?: Record<string, string>;
}

export function request<T>(options: IRequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as T);
        } else {
          reject(new Error(`Request failed: ${res.statusCode}`));
        }
      },
      fail: reject
    });
  });
}
```

## 注意事项

1. 始终使用 TypeScript 严格类型
2. 样式使用 rpx 单位
3. 组件使用 usingComponents 声明
4. 遵循项目命名规范
