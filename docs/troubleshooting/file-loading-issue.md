# Electron + Vite 应用文件加载问题排查

## 问题描述

应用在开发环境下出现文件加载错误：

```
GET file:///src/main.tsx net::ERR_FILE_NOT_FOUND
```

这个错误表明应用无法找到入口文件 `main.tsx`，这是由于开发环境下的文件路径解析问题导致的。

## 问题分析

### 1. 数据流程梳理

开发环境下的文件加载流程：

```
1. Electron 主进程启动
2. 创建主窗口 (createWindow)
3. 加载 index.html
4. index.html 尝试加载 main.tsx
5. Vite 开发服务器处理资源请求
```

### 2. 问题根源

1. 路径解析问题：

   - 使用了绝对路径 `/src/main.tsx`
   - 在文件协议 (file://) 下无法正确解析

2. 开发环境配置：
   - 没有正确处理 Vite 开发服务器的 URL
   - 文件加载策略在开发和生产环境下不一致

## 解决方案

### 1. 路径修复

1. 修改 HTML 文件中的路径：

```html
<!-- 修改前 -->
<script type="module" src="/src/main.tsx"></script>

<!-- 修改后 -->
<script type="module" src="./src/main.tsx"></script>
```

### 2. Electron 主进程配置

1. 开发环境配置：

```typescript
const isDevelopment = process.env.NODE_ENV !== 'production'
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

if (isDevelopment && VITE_DEV_SERVER_URL) {
  // 开发环境：使用 Vite 开发服务器
  mainWindow.loadURL(VITE_DEV_SERVER_URL)
} else {
  // 生产环境：加载打包后的文件
  mainWindow.loadFile(join(__dirname, '../dist/index.html'))
}
```

2. 面板窗口配置：

```typescript
if (isDevelopment && VITE_DEV_SERVER_URL) {
  const panelURL = new URL(
    '/src/app/prompt-panel/prompt-panel.html',
    VITE_DEV_SERVER_URL
  ).href
  promptPanel.loadURL(panelURL)
} else {
  promptPanel.loadFile(join(__dirname, '../dist/prompt-panel.html'))
}
```

## 解决思路

1. **问题定位**：

   - 通过错误信息定位到文件加载问题
   - 检查文件路径和加载机制
   - 分析开发环境和生产环境的差异

2. **数据流程分析**：

   - 梳理应用启动流程
   - 检查文件加载顺序
   - 验证资源请求路径

3. **环境配置优化**：

   - 区分开发和生产环境
   - 正确处理 Vite 开发服务器
   - 统一路径解析策略

4. **调试优化**：
   - 添加详细的日志记录
   - 实现错误处理机制
   - 提供开发者工具支持

## 预防措施

1. **路径处理**：

   - 使用相对路径而不是绝对路径
   - 统一路径解析策略
   - 提供路径别名配置

2. **环境配置**：

   - 明确区分开发和生产环境
   - 提供环境变量配置
   - 统一配置管理

3. **错误处理**：
   - 实现全面的错误捕获
   - 提供详细的错误信息
   - 添加备用加载机制

## 后续建议

1. 添加自动化测试以验证文件加载
2. 实现文件加载状态监控
3. 优化开发环境的热重载机制
4. 完善错误处理和用户反馈机制
