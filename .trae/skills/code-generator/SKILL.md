---
name: "code-generator"
description: "代码生成助手，根据需求生成标准化代码片段和文件。Invoke when user needs to generate code snippets, templates, or boilerplate code for the project."
---

# 代码生成助手

## 功能概述

根据用户需求生成符合项目规范的代码片段、模板文件和 boilerplate 代码。

## 使用场景

1. **生成页面代码**: 快速创建完整的页面文件
2. **生成组件代码**: 创建可复用的组件
3. **生成工具函数**: 创建通用的工具函数
4. **生成类型定义**: 创建 TypeScript 接口和类型

## 生成规范

### 1. 页面生成

**输入**: 页面名称、功能描述
**输出**: 完整的页面目录和文件

**示例**:
```
需求: 创建用户资料页面
生成:
- pages/user-profile/index.ts
- pages/user-profile/index.less
- pages/user-profile/index.wxml
- pages/user-profile/index.json
```

### 2. 组件生成

**输入**: 组件名称、props 定义
**输出**: 完整的组件目录和文件

**示例**:
```
需求: 创建按钮组件，支持 size 和 type 属性
生成:
- components/custom-button/index.ts
- components/custom-button/index.less
- components/custom-button/index.wxml
- components/custom-button/index.json
```

### 3. 工具函数生成

**输入**: 函数功能描述
**输出**: 完整的工具函数代码

**示例**:
```typescript
// utils/format.ts
export function formatDate(date: Date, format: string): string {
  // 实现代码
}
```

### 4. 类型定义生成

**输入**: 数据结构描述
**输出**: TypeScript 接口定义

**示例**:
```typescript
// types/user.ts
export interface IUserInfo {
  id: number;
  nickname: string;
  avatarUrl: string;
  createTime: string;
}
```

## 代码风格

1. **TypeScript**: 使用严格类型，避免 any
2. **命名**: 遵循项目命名规范
3. **注释**: 关键逻辑添加注释
4. **格式**: 使用一致的缩进和换行

## 生成流程

1. 理解用户需求
2. 选择合适的模板
3. 生成符合规范的代码
4. 提供使用说明

## 注意事项

- 生成的代码必须符合项目规范
- 提供完整的文件路径
- 包含必要的类型定义
- 考虑边界情况和错误处理
