# Electron 类型声明冲突问题

## 问题描述

在 TypeScript 编译时出现类型声明冲突错误和 ESLint 错误，具体表现为：

1. `Window.electron` 属性在多个文件中被重复声明
2. `ElectronAPI` 类型在不同文件中定义不一致
3. 类型导入路径不正确，导致类型不兼容
4. ESLint 报错：不应使用 triple slash reference
5. ESLint 报错：不应使用 require 语句

错误信息：

```typescript
// 错误 1：重复声明
后续属性声明必须属于同一类型。属性"electron"的类型必须为"ElectronAPI | undefined"，但此处却为类型"ElectronAPI | undefined"。

// 错误 2：类型不兼容
不能将类型"import("electron/electron-env").ElectronAPI"分配给类型"import("electron/types").ElectronAPI"。
  在这些类型中，"prompt.addDirectory" 的类型不兼容。

// 错误 3：ESLint
Do not use a triple slash reference for ../../electron/electron-env, use `import` style instead

// 错误 4：ESLint
Require statement not part of import statement
```

## 问题原因

1. 在 `src/lib/electron.ts` 和 `electron/electron-env.d.ts` 中都声明了 `Window.electron` 属性
2. 从错误的文件导入了 `ElectronAPI` 类型（从 `types.ts` 而不是 `electron-env.d.ts`）
3. 类型定义分散在多个文件中，导致同步更新困难
4. 使用了不推荐的 triple slash reference 语法
5. 使用了 CommonJS 的 require 语句而不是 ES 模块导入

## 解决方案

### 1. 移除重复声明

在 `src/lib/electron.ts` 中，移除重复的 `Window` 接口声明：

```typescript
// 移除这段代码
declare global {
  interface Window {
    electron: ElectronAPI | undefined
  }
}
```

### 2. 修正类型导入

使用标准的 import 语法导入类型：

```typescript
// 修改前
/// <reference types="../../electron/electron-env" />
import type { ElectronAPI } from '../../electron/electron-env'

// 修改后
import type { ElectronAPI } from '../../electron/electron-env'
```

### 3. 简化类型断言

移除不必要的类型断言：

```typescript
// 修改前
return window.electron as ElectronAPI

// 修改后
return window.electron
```

### 4. 替换 require 语句

将 CommonJS 的 require 语句替换为 ES 模块导入和文件读取：

```typescript
// 修改前
const { execSync } = require('child_process')
const pkg = require(join(__dirname, '../package.json'))
const systemPrompts = require(systemPromptsPath)

// 修改后
import { execSync } from 'child_process'
import { readFileSync } from 'fs'

function loadSystemPrompts(systemPromptsPath: string): SystemPrompts {
  const fileContent = readFileSync(systemPromptsPath, 'utf-8')
  return JSON.parse(fileContent)
}

function loadPackageJson(): any {
  const pkgPath = join(__dirname, '../package.json')
  const fileContent = readFileSync(pkgPath, 'utf-8')
  return JSON.parse(fileContent)
}
```

## 最终代码

```typescript
import type { ElectronAPI } from '../../electron/electron-env'

export function getElectronAPI(): ElectronAPI {
  if (!window.electron) {
    throw new Error('Electron API not available')
  }

  return window.electron
}
```

## 经验总结

1. 避免在多个文件中重复声明全局类型
2. 确保从正确的源文件导入类型
3. 保持类型定义的一致性和集中管理
4. 移除不必要的类型断言，依赖 TypeScript 的类型推断
5. 使用标准的 import 语法代替 triple slash reference
6. 遵循 ESLint 规则，保持代码风格一致性
7. 使用 ES 模块语法代替 CommonJS 的 require

## 相关文件

- `src/lib/electron.ts`
- `electron/electron-env.d.ts`
- `electron/types.ts`
- `electron/main.ts`

## 参考资料

- [TypeScript Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
- [TypeScript Modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [ESLint TypeScript Rules](https://typescript-eslint.io/rules/)
- [Electron TypeScript Support](https://www.electronjs.org/docs/latest/tutorial/typescript)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
