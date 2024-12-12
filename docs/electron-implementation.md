# Electron 应用实现文档

## 1. 项目结构

```
project/
├── electron/
│   ├── main.ts           # 主进程
│   ├── preload.ts        # 预加载脚本
│   └── electron-env.d.ts # Electron 类型定义
├── src/
│   ├── components/       # React 组件
│   ├── styles/          # 全局样式
│   └── vite-env.d.ts    # Vite 类型定义
└── vite.config.ts       # Vite 配置
```

## 2. 核心功能实现

### 2.1 窗口状态管理

```typescript
interface WindowState {
  x: number
  y: number
  width: number
  height: number
  isVisible: boolean
}

// 使用 electron-store 持久化窗口状态
const store = new Store<{
  windowState: WindowState
}>()
```

### 2.2 IPC 通信接口

```typescript
interface ElectronAPI {
  window: {
    minimize: () => void
    maximize: () => void
    close: () => void
    hide: () => void
    show: () => void
    togglePin: () => void
    getPinState: () => Promise<boolean>
  }
  clipboard: {
    writeText: (text: string) => void
    readText: () => string
  }
}
```

### 2.3 窗口创建和配置

```typescript
function createWindow() {
  mainWindow = new BrowserWindow({
    frame: false, // 无边框窗口
    transparent: true, // 透明背景
    alwaysOnTop: false, // 默认不置顶
    skipTaskbar: false, // 显示在任务栏
    show: false, // 初始不显示
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  })
}
```

## 3. 关键功能实现

### 3.1 窗口位置管理

```typescript
// 确保窗口在可视区域内
const { width: screenWidth, height: screenHeight } =
  screen.getPrimaryDisplay().workAreaSize
if (x < 0 || x > screenWidth || y < 0 || y > screenHeight) {
  windowState = {
    ...windowState,
    x: Math.round(screenWidth / 2 - width / 2),
    y: Math.round(screenHeight / 2 - height / 2),
  }
}
```

### 3.2 全局快捷键

```typescript
globalShortcut.register('CommandOrControl+Shift+V', () => {
  if (!mainWindow) return
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    // 显示窗口并恢复位置
    const windowState = store.get('windowState')
    if (windowState) {
      mainWindow.setBounds({...})
    }
    mainWindow.show()
    mainWindow.focus()
  }
})
```

### 3.3 平台特定优化

```typescript
if (process.platform === 'darwin') {
  // macOS 输入法优化
  app.commandLine.appendSwitch('disable-features', 'IMEInputContextInBrowser')

  // Dock 图标处理
  app.dock.show()
  app.on('activate', () => {
    if (!mainWindow) {
      createWindow()
    } else if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
  })
}
```

## 4. 事件处理

### 4.1 窗口状态保存

```typescript
function saveWindowState() {
  if (!mainWindow) return
  const bounds = mainWindow.getBounds()
  const isVisible = mainWindow.isVisible()
  store.set('windowState', { ...bounds, isVisible })
}

mainWindow.on('close', saveWindowState)
mainWindow.on('moved', saveWindowState)
mainWindow.on('resize', saveWindowState)
```

### 4.2 自动隐藏

```typescript
app.on('browser-window-blur', () => {
  if (mainWindow && !isAlwaysOnTop) {
    setTimeout(() => {
      if (mainWindow && !mainWindow.isFocused() && !isAlwaysOnTop) {
        mainWindow.hide()
      }
    }, 100)
  }
})
```

## 5. 开发注意事项

1. **窗口状态**：

   - 确保保存和恢复窗口位置
   - 处理屏幕边界情况
   - 考虑多显示器场景

2. **事件处理**：

   - 使用适当的延迟避免事件冲突
   - 正确处理窗口焦点和失焦
   - 保存窗口状态的时机

3. **平台兼容**：

   - macOS 输入法问题处理
   - Dock 图标和任务栏行为
   - 平台特定的快捷键

4. **性能优化**：
   - 避免频繁的状态保存
   - 合理使用事件监听
   - 处理内存泄漏

## 6. 调试技巧

1. 开发模式下打开开发者工具：

```typescript
if (process.env.NODE_ENV === 'development') {
  mainWindow.webContents.openDevTools()
}
```

2. 使用 electron-store 查看存储的数据：

```typescript
console.log('Window State:', store.get('windowState'))
```

## 7. 已知问题和解决方案

1. macOS 输入法警告：

   - 使用 `disable-features` 开关禁用浏览器输入法上下文

2. 窗口闪烁：

   - 使用延迟处理窗口显示/隐藏
   - 确保窗口状态正确保存和恢复

3. 任务栏图标：
   - 设置 `skipTaskbar: false` 确保应用可见
   - 正确处理窗口最小化和恢复

```

这个文档记录了主要的实现细节和注意事项，可以作为后续开发和维护的参考。需要我补充或详细解释任何部分吗？
```
