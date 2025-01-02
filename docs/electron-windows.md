# Electron 主子窗口实现指南

## 1. 窗口创建和管理

### 1.1 主窗口创建

```typescript
const mainWindow = new BrowserWindow({
  // 基本配置
  width: 800,
  height: 600,
  frame: false,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: join(__dirname, 'preload.js'),
  },
})
```

### 1.2 子窗口创建

```typescript
const childWindow = new BrowserWindow({
  width: 800,
  height: 600,
  frame: false,
  skipTaskbar: false, // 保持在任务栏显示
  show: false, // 初始不显示，等加载完成后显示
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: join(__dirname, 'preload.js'),
  },
})
```

## 2. 窗口通信实现

### 2.1 IPC 通信设置

```typescript
// preload.ts
contextBridge.exposeInMainWorld('electron', {
  send: (channel: string, data?: any) => {
    ipcRenderer.send(channel, data)
  },
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, ...args) => callback(...args))
  },
})

// main.ts
ipcMain.on('channel-name', (event, data) => {
  // 处理消息
})
```

### 2.2 数据传递流程

1. 子窗口准备就绪时发送信号
2. 主进程收到信号后向主窗口请求数据
3. 主窗口返回数据给主进程
4. 主进程将数据转发给子窗口

## 3. 常见问题及解决方案

### 3.1 窗口消失问题

- **问题**: 点击其他窗口时，子窗口消失
- **解决**:

  ```typescript
  // 设置窗口置顶
  childWindow.setAlwaysOnTop(true, 'floating')

  // 监听失焦事件
  childWindow.on('blur', () => {
    if (!childWindow.isDestroyed()) {
      childWindow.setAlwaysOnTop(true, 'floating')
    }
  })
  ```

### 3.2 数据通信问题

- **问题**: 子窗口无法接收数据
- **解决**:
  1. 确保事件监听器正确设置
  2. 使用 `once` 而不是 `on` 避免重复监听
  3. 添加详细的日志记录
  ```typescript
  ipcMain.once('panel:ready', () => {
    console.log('Panel ready, requesting data')
    mainWindow?.webContents.send('get-prompts')
  })
  ```

### 3.3 窗口管理问题

- **问题**: 窗口创建和销毁时的内存泄漏
- **解决**:

  ```typescript
  // 窗口关闭时清理
  childWindow.on('closed', () => {
    childWindow = null
  })

  // 应用退出时清理
  app.on('before-quit', () => {
    if (childWindow) {
      childWindow.destroy()
      childWindow = null
    }
  })
  ```

### 3.4 输入法问��

- **问题**: macOS 下输入法异常
- **解决**:
  ```typescript
  if (isMac) {
    app.commandLine.appendSwitch('disable-features', 'IMEInputContextInBrowser')
    app.commandLine.appendSwitch('disable-ime-composition')
  }
  ```

## 4. 最佳实践

### 4.1 窗口创建

- 使用 `try-catch` 包裹窗口创建代码
- 在显示窗口前完成所有初始化
- 使用 `isDestroyed()` 检查窗口状态

### 4.2 数据通信

- 实现可靠的错误处理
- 添加详细的日志记录
- 使用 TypeScript 类型确保数据结构正确

### 4.3 性能优化

- 延迟加载非关键资源
- 合理使用事件监听器
- 及时清理不需要的资源

### 4.4 安全考虑

- 使用 `contextIsolation: true`
- 限制 `nodeIntegration`
- 实现适当的 CSP 策略

## 5. 调试技巧

### 5.1 日志记录

```typescript
console.log('Window state:', {
  isVisible: window.isVisible(),
  isDestroyed: window.isDestroyed(),
  bounds: window.getBounds(),
})
```

### 5.2 开发工具

```typescript
if (process.env.NODE_ENV === 'development') {
  childWindow.webContents.openDevTools()
}
```

### 5.3 错误处理

```typescript
window.webContents.on('render-process-gone', (event, details) => {
  console.error('Render process gone:', details)
  // 尝试恢复或重新加载
})
```
