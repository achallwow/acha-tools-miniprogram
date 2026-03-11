# 微信小程序开发规范

## 项目结构

```
miniprogram/
├── components/          # 公共组件
│   └── navigation-bar/  # 导航栏组件示例
├── pages/               # 页面
│   ├── index/           # 首页
│   └── logs/            # 日志页
├── utils/               # 工具函数
├── images/              # 图片资源
├── static/              # 静态资源
├── app.ts               # 应用入口
├── app.json             # 应用配置
├── app.less             # 全局样式
└── sitemap.json         # 站点地图
```

## 技术栈

- **框架**: 微信小程序原生开发
- **语言**: TypeScript
- **样式**: Less
- **组件**: 自定义组件 + 微信原生组件

## 命名规范

### 文件命名
- 页面/组件目录: 小写，短横线连接 (e.g., `user-profile`)
- TypeScript 文件: 小写 (e.g., `index.ts`)
- 样式文件: 小写 (e.g., `index.less`)
- 模板文件: 小写 (e.g., `index.wxml`)

### 变量命名
- 组件/类名: PascalCase (e.g., `NavigationBar`)
- 函数/变量: camelCase (e.g., `getUserInfo`)
- 常量: UPPER_SNAKE_CASE (e.g., `MAX_COUNT`)

## 代码规范

### TypeScript
- 使用严格类型检查
- 接口命名前缀 `I` (e.g., `IUserInfo`)
- 避免使用 `any` 类型

### WXML
- 使用双引号
- 属性按字母顺序排列
- 复杂逻辑移至 TS 文件

### Less
- 使用嵌套规则
- 变量名使用 `@` 前缀
- 避免过深嵌套（不超过 4 层）

## 开发流程

1. **创建页面/组件**: 使用 Skill 生成标准模板
2. **编写代码**: 遵循上述规范
3. **本地测试**: 微信开发者工具预览
4. **代码审查**: 检查类型和样式
5. **提交代码**: 遵循 commit 规范

## 数据流向与状态管理

### 全局状态
- 统一存放在 `app.ts` 的 `globalData` 中
- 通过 `getApp()` 访问和修改
- 适用于：用户信息、登录状态、系统配置

### 页面间数据传递
- **简单数据**（字符串、数字）：使用 URL 参数 (`options`)
- **复杂对象**：使用 `wx.setStorageSync` / `wx.getStorageSync`
- **事件通信**：使用 `EventChannel` (页面间实时通信)

### 组件通信
- 父传子：通过 `properties`
- 子传父：通过 `triggerEvent`
- 跨组件：使用全局状态或事件总线

## API 调用规范

- 统一封装在 `services/` 目录
- 使用 Promise 封装异步操作
- 自动处理 loading 状态
- 统一错误拦截和 Token 注入
- 请求头中预留 Authorization 位置

## 性能优化

- 图片使用 CDN 或压缩
- 避免频繁 setData
- 分包加载优化首屏

## 注意事项

- 主包大小不超过 2MB
- 分包大小不超过 2MB
- 总大小不超过 20MB
- 遵循微信小程序审核规范
