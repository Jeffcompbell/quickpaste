# Electron 窗口控制实现总结

## 问题描述

在实现 Electron 应用的窗口控制时，遇到了以下几个问题：

1. 窗口控制按钮重复显示

   - 自定义实现的控制按钮与系统原生按钮同时显示
   - 导致界面混乱，用户体验差

2. 平台兼容性问题

   - macOS 和 Windows 的窗口控制风格差异
   - 需要针对不同平台进行适配

3. 标题栏布局问题
   - 窗口控制按钮与标题文字重叠
   - 缺少合适的标题栏空间
   - 标题栏拖拽功能不正常

## 解决方案

### 1. 使用原生窗口控制

在 `main.ts` 中针对不同平台配置窗口：

```typescript
mainWindow = new BrowserWindow({
  frame: !isMac, // Windows 使用默认边框，macOS 使用自定义标题栏
  ...(isMac
    ? {
        titleBarStyle: 'hiddenInset', // macOS 显示原生窗口控制按钮
        trafficLightPosition: { x: 20, y: 18 }, // 调整控制按钮位置
        vibrancy: 'window',
        visualEffectState: 'active',
      }
    : {}),
})
```

### 2. 移除自定义控制按钮

1. 删除自定义的 TitleBar 组件
2. 使用系统原生的窗口控制按钮
3. 保持窗口功能的统一性

### 3. 优化标题栏布局

在 `layout.tsx` 中添加标题栏区域：

```typescript
<div
  className={cn(
    'h-12 flex items-center justify-center',
    'app-drag-region', // 添加拖拽区域类名
    isMac ? 'pl-20' : 'pl-4' // 根据平台调整左侧内边距
  )}
>
  <h1 className="text-sm font-medium text-gray-500 select-none pointer-events-none">
    Quick Paste
  </h1>
</div>
```

### 4. 实现拖拽区域

在全局样式 `index.css` 中添加拖拽区域样式：

```css
/* 窗口拖拽区域样式 */
.app-drag-region {
  -webkit-app-region: drag;
  app-region: drag;
}

.app-no-drag {
  -webkit-app-region: no-drag;
  app-region: no-drag;
}
```

关键实现：

- 设置固定高度 (`h-12`)
- macOS 上添加左侧内边距 (`pl-20`) 避开控制按钮
- Windows 上添加适当的左侧内边距 (`pl-4`)
- 标题文字居中显示
- 标题文字不可选中且不影响拖拽 (`select-none pointer-events-none`)
- 使用 CSS 属性设置拖拽区域

## 最佳实践

1. 平台特定处理

   - 使用 `process.platform === 'darwin'` 判断平台
   - 针对不同平台采用对应的窗口控制方案
   - 根据平台调整标题栏布局和内边距

2. 窗口配置

   - macOS：使用 `titleBarStyle: 'hiddenInset'` 显示原生控制按钮
   - Windows：使用 `frame: true` 保持原生窗口边框
   - 正确配置拖拽区域

3. 布局适配
   - 为窗口控制按钮预留足够空间
   - 使用条件类名处理平台差异
   - 保持界面的一致性和美观性
   - 确保拖拽区域正常工作

## 注意事项

1. 平台差异

   - macOS 和 Windows 的窗口控制位置不同
   - 窗口行为需要针对平台特性调整
   - 拖拽区域的实现方式统一

2. 用户体验

   - 保持与操作系统一致的交互方式
   - 避免自定义控制按钮造成的混淆
   - 确保窗口拖拽操作流畅

3. 维护性
   - 使用平台检测常量提高代码可维护性
   - 通过条件渲染处理平台特定的样式和行为
   - 将拖拽相关样式集中管理
