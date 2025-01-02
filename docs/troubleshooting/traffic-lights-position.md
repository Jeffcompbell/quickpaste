# 红绿灯位置问题修复文档

## 问题描述

在 macOS 系统下，应用窗口的红绿灯按钮（最小化、最大化、关闭）位置与标题栏未对齐，导致视觉效果不佳。具体表现为：

- 红绿灯按钮垂直方向上偏离标题栏中心
- 红绿灯按钮水平方向上距离左边框太远

## 实现方案

### 1. 窗口配置调整

在 `electron/main.ts` 文件中，通过调整 `BrowserWindow` 的配置参数来修复此问题：

```typescript
mainWindow = new BrowserWindow({
  // ... 其他配置
  frame: false,
  titleBarStyle: 'customButtonsOnHover',
  trafficLightPosition: { x: 16, y: 10 }, // 调整红绿灯按钮位置
})
```

关键参数说明：

- `frame: false`: 使用无边框窗口
- `titleBarStyle: 'customButtonsOnHover'`: 使用自定义标题栏样式
- `trafficLightPosition`: 设置红绿灯按钮的位置
  - `x: 16`: 距离左边框 16 像素
  - `y: 10`: 距离顶部 10 像素

### 2. 标题栏样式调整

在 `src/app/layout/index.tsx` 中，调整标题栏容器的样式：

```typescript
<div className="h-12 flex items-center bg-white window-drag relative border-b border-gray-200">
  <div className="absolute left-0">
    <TitleBar />
  </div>
  <div className="flex-1 text-center">
    <span className="text-sm font-medium text-gray-600">ProPaste</span>
  </div>
</div>
```

在 `src/components/title-bar.tsx` 中，调整红绿灯占位区域的样式：

```typescript
<div className="h-8 flex items-center justify-start webkit-app-region-drag bg-transparent">
  <div className="w-20 h-full" />
</div>
```

## 注意事项

1. **平台兼容性**

   - `trafficLightPosition` 配置仅在 macOS 系统下生效
   - 在其他操作系统上需要使用不同的窗口控制按钮处理方式

2. **窗口大小影响**

   - 标题栏高度 (`h-12`) 需要与红绿灯按钮位置相协调
   - 最小窗口尺寸设置需要考虑标题栏的完整显示

3. **样式调整**

   - 使用 `window-drag` 类使整个标题栏可拖动
   - 使用 `webkit-app-region-drag` 确保 macOS 下的拖动功能正常工作
   - 标题文本需要居中显示，不受红绿灯位置影响

4. **调试建议**
   - 修改 `trafficLightPosition` 后需要重启应用才能看到效果
   - 可以通过开发者工具检查标题栏元素的实际尺寸和位置
