# Electron macOS Dock 图标点击处理

## 问题描述

在 macOS 平台上，需要正确处理以下场景：

1. 应用窗口被隐藏时，需要重新显示窗口
2. 应用窗口被关闭时，需要重新创建窗口
3. 点击窗口关闭按钮时，应该隐藏窗口而不是退出应用
4. 从 Dock 菜单退出应用时，需要完全退出应用

## 实现方案

### 1. 退出标志管理

```typescript
// 添加一个标志来跟踪应用是否正在退出
let isQuitting = false

// 在应用退出前设置退出标志
app.on('before-quit', () => {
  isQuitting = true
})
```

### 2. 窗口关闭行为

```typescript
// macOS 下点击关闭按钮时隐藏窗口而不是关闭
mainWindow.on('close', event => {
  if (!isQuitting) {
    event.preventDefault()
    mainWindow?.hide()
    return false
  }
  return true
})
```

### 3. Dock 菜单配置

```typescript
if (isMac) {
  app.dock.setMenu(
    Menu.buildFromTemplate([
      {
        label: '退出',
        click: () => {
          isQuitting = true
          app.quit()
        },
      },
    ])
  )
}
```

### 4. Dock 图标点击处理

```typescript
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  } else {
    mainWindow.show()
    mainWindow.focus()
    app.dock.show() // 显示 dock 图标
  }
})
```

## 关键点说明

1. 退出控制

   - 使用 `isQuitting` 标志区分真正退出和隐藏窗口
   - 在 `before-quit` 事件中设置退出标志
   - 在 Dock 菜单退出选项中设置退出标志

2. 窗口状态

   - 点击关闭按钮时隐藏窗口
   - 保存窗口位置和大小状态
   - 恢复时使用保存的状态

3. Dock 交互
   - 点击 Dock 图标时显示窗口
   - 提供退出选项在 Dock 右键菜单中
   - 正确处理 Dock 图标的显示和隐藏

## 最佳实践

1. 窗口管理

   - 使用 `isQuitting` 标志控制退出行为
   - 保存窗口状态以提供更好的用户体验
   - 确保窗口位置在可视区域内

2. 应用生命周期

   - 正确处理应用的退出流程
   - 区分隐藏窗口和退出应用的行为
   - 保持应用在后台运行直到用户主动退出

3. 用户体验
   - 符合 macOS 平台的使用习惯
   - 提供清晰的退出选项
   - 保持窗口状态的连续性

## 注意事项

1. 内存管理

   - 隐藏窗口而不是关闭可能会占用更多内存
   - 需要合理处理后台资源

2. 状态同步

   - 确保窗口状态和应用状态的一致性
   - 正确处理 Dock 图标状态

3. 平台兼容
   - 代码需要考虑跨平台兼容性
   - 使用平台检测来应用特定行为
   - 确保 Windows 平台下的正常运行
