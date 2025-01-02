# Panel 问题修复总结

## 问题描述

1. Panel 面板空白，没有数据显示

   - 原因：IPC 通信接口不匹配，导致数据无法正确传递
   - 表现：面板加载后显示空白，没有提示词和分类

2. 分类重复显示

   - 原因：系统分类在前端和后端都进行了定义和添加
   - 表现：同一个分类出现两次

3. 提示词加载不完整
   - 原因：系统预设提示词和用户自定义提示词没有正确合并
   - 表现：只显示部分提示词或完全不显示

## 解决方案

### 1. IPC 通信修复

1. 统一 IPC 接口定义

```typescript
// src/lib/electron.ts
export interface ElectronAPI {
  panel: {
    ready: () => void
    onData: (callback: (data: any) => void) => () => void
  }
  // ... 其他接口
}
```

2. 更新组件中的 IPC 调用

```typescript
// 从
electron.on('prompts-data', callback)
// 改为
electron.panel.onData(callback)

// 从
electron.send('panel:ready')
// 改为
electron.panel.ready()
```

### 2. 分类管理优化

1. 在主进程中过滤系统分类

```typescript
// electron/main.ts
promptPanel.webContents.send('prompts-data', {
  prompts: allPrompts,
  categories: categories.filter(cat => !cat.isSystem), // 只发送非系统分类
})
```

2. 在前端统一管理系统分类

```typescript
// src/app/prompt-panel/PromptPanel.tsx
const allCategories = [
  { id: 'all', name: SYSTEM_CATEGORIES.all },
  ...Object.entries(SYSTEM_CATEGORIES)
    .filter(([id]) => id !== 'all')
    .map(([id, name]) => ({ id, name, isSystem: true })),
  ...(promptData.categories || []).filter(
    cat => !SYSTEM_CATEGORIES[cat.id as keyof typeof SYSTEM_CATEGORIES]
  ),
]
```

### 3. 提示词加载优化

1. 在主进程中合并系统和用户提示词

```typescript
// electron/main.ts
// 处理系统提示词
const processPrompt = (prompt: SystemPrompt, category: string): Prompt => ({
  ...prompt,
  category,
  type: 'product',
  author: 'System',
  createTime: Date.now(),
  updateTime: Date.now(),
  isSystem: true,
})

// 合并系统提示词
const systemPromptsList = [
  ...(systemPrompts.requirement || []).map(p =>
    processPrompt(p, 'requirement')
  ),
  ...(systemPrompts.debug || []).map(p => processPrompt(p, 'debug')),
  ...(systemPrompts.deployment || []).map(p => processPrompt(p, 'deployment')),
  ...(systemPrompts.summary || []).map(p => processPrompt(p, 'summary')),
]

// 合并系统提示词和用户提示词
const allPrompts = [...systemPromptsList, ...prompts]
```

## 最佳实践

1. **数据流向**

   - 系统预设数据在主进程中加载和处理
   - 用户自定义数据从 Store 中读取
   - 合并后的完整数据通过 IPC 发送到渲染进程

2. **分类管理**

   - 系统分类在前端定义和管理
   - 用户自定义分类在后端存储和管理
   - 确保分类不重复且层级清晰

3. **提示词处理**

   - 系统提示词添加 `isSystem: true` 标记
   - 用户提示词保持原有属性
   - 统一提示词数据结构

4. **调试优化**
   - 添加详细的日志记录
   - 在关键节点打印数据状态
   - 使用 DevTools 监控数据流转
