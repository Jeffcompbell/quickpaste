# Electron Web 兼容性问题解决方案

## 问题描述

在开发 Electron 应用时，我们遇到了在浏览器环境中访问 `window.electron` 时的兼容性问题：

```typescript
// 错误信息
Uncaught TypeError: Cannot read properties of undefined (reading 'window')
```

主要原因是在非 Electron 环境（如浏览器）中直接访问 `window.electron` API。

## 解决方案

### 1. 环境变量配置

在 `vite.config.ts` 中添加环境变量定义：

```typescript
export default defineConfig({
  // ... 其他配置
  define: {
    'process.env.IS_ELECTRON': JSON.stringify(!!process.env.ELECTRON),
  },
})
```

### 2. 类型声明扩展

在 `src/vite-env.d.ts` 中添加环境变量类型：

```typescript
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly IS_ELECTRON: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 3. Electron API 安全访问

创建 `src/lib/electron.ts` 工具函数：

```typescript
export function isElectron(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    window.electron &&
    process.env.IS_ELECTRON
  )
}

export function getElectronAPI() {
  if (!isElectron()) {
    return {
      window: {
        minimize: () => {},
        maximize: () => {},
        close: () => {},
        hide: () => {},
        show: () => {},
        togglePin: () => {},
        getPinState: () => Promise.resolve(false),
      },
      clipboard: {
        writeText: (text: string) => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
          }
        },
        readText: () => '',
      },
    }
  }
  return window.electron
}
```

### 4. 组件中的使用

修改组件中的 Electron API 调用：

```typescript
import { getElectronAPI } from '@/lib/electron'

export function Component() {
  const electron = getElectronAPI()

  // 替换直接访问
  // window.electron.window.minimize()
  // 使用安全访问
  electron.window.minimize()
}
```

## 实现细节

### 1. 降级处理

- 在非 Electron 环境中提供空实现
- 对于剪贴板操作，使用 Web API 作为降级方案
- 返回合理的默认值避免运行时错误

### 2. 类型安全

```typescript
// electron/electron-env.d.ts
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

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
```

### 3. 环境检测

- 使用 `process.env.IS_ELECTRON` 判断运行环境
- 检查 `window.electron` 是否可用
- 提供类型安全的 API 访问方式

## 最佳实践

1. **环境检测**

   - 始终使用 `getElectronAPI()` 而不是直接访问 `window.electron`
   - 在使用 Electron 特定功能前检查环境

2. **错误处理**

   ```typescript
   const electron = getElectronAPI()
   try {
     await electron.window.getPinState()
   } catch (error) {
     console.error('Failed to get pin state:', error)
   }
   ```

3. **降级策略**

   - 为关键功能提供 Web API 降级方案
   - 确保应用在非 Electron 环境中不会崩溃

4. **类型安全**
   - 使用 TypeScript 接口定义 API 结构
   - 为所有 Electron API 提供类型声明

## 注意事项

1. 开发环境

   - 确保在开发服务器中正确设置环境变量
   - 使用 Vite 的 `define` 配置注入环境变量

2. 生产环境

   - 确保构建时正确设置 `process.env.ELECTRON`
   - 测试降级功能在生产环境中的表现

3. 调试
   - 使用环境检测函数帮助调试
   - 在��发工具中监控 API 调用

## 相关文件

- `vite.config.ts`
- `src/vite-env.d.ts`
- `src/lib/electron.ts`
- `electron/electron-env.d.ts`
- `src/components/**/*.tsx`
