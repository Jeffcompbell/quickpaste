# QuickPaste

## 📝 产品介绍

QuickPaste 是一款桌面端 AI 提示词管理工具，帮助用户在任何输入场景下实现提示词的快速管理和使用。

## ✨ 核心功能

### 窗口管理

- 全局快捷键唤起（默认 `Cmd/Ctrl + Shift + V`）
- 智能悬浮窗口
  - 位置记忆功能
  - 大小自由调整
  - 自动隐藏
  - 多显示器支持

### 提示词管理

- 多类型提示词支持
  - Cursor 提示词
  - System Prompt（支持跳转至 cursor.directory）
  - PRD 提示词
- 分类管理
  - 自定义一级分类
  - 快速检索
  - 分类间拖拽
- 快捷操作
  - 一键插入
  - 快速复制
  - 变量替换（日期、时间、剪贴板内容）

### 快捷键系统

| 功能     | Windows            | macOS             |
| -------- | ------------------ | ----------------- |
| 呼出窗口 | `Ctrl + Shift + V` | `Cmd + Shift + V` |
| 搜索     | `Ctrl + F`         | `Cmd + F`         |
| 隐藏窗口 | `Esc`              | `Esc`             |

### 数据管理

- JSON 格式导入导出
- 本地数据持久化
- 完全离线支持

## 🛠 技术实现路线

### 1. 项目初始化与基础架构（Sprint 1）

- [x] 使用 Vite + Electron + React + TypeScript 搭建项目
- [ ] 配置 ESLint、Prettier、Husky
- [ ] 设置基础开发环境
- [ ] 配置自动化构建流程

### 2. 窗口管理实现（Sprint 2）

- [ ] 主进程窗口管理 `typescript
// 示例代码结构
interface WindowConfig {
  width: number;
  height: number;
  position: { x: number; y: number };
  isAlwaysOnTop: boolean;
}  `
- [ ] 全局快捷键注册
- [ ] 窗口位置记忆功能
- [ ] 多显示器支持

### 3. 提示词管理系统（Sprint 3-4）

- [ ] 数据结构设计 `typescript
interface Prompt {
  id: string;
  type: 'cursor' | 'system' | 'prd';
  category: string;
  content: string;
  variables?: string[];
  tags?: string[];
}  `
- [ ] 本地存储实现
- [ ] 分类管理功能
- [ ] 搜索系统实现

### 4. UI 组件开发（Sprint 5）

- [ ] 布局组件
- [ ] 提示词卡片组件
- [ ] 分类导航组件
- [ ] 搜索组件
- [ ] 设置面板

### 5. 状态管理与数据流（Sprint 6）

- [ ] Zustand 状态设计 `typescript
interface PromptStore {
  prompts: Prompt[];
  categories: Category[];
  actions: {
    addPrompt: (prompt: Prompt) => void;
    updatePrompt: (id: string, prompt: Partial<Prompt>) => void;
    deletePrompt: (id: string) => void;
  };
}  `
- [ ] IPC 通信实现
- [ ] 数据持久化

### 6. 功能完善（Sprint 7）

- [ ] 变量系统实现
- [ ] 导入导出功能
- [ ] 快捷键配置
- [ ] 主题支持

### 7. 性能优化（Sprint 8）

- [ ] 启动性能优化
- [ ] 搜索性能优化
- [ ] 内存占用优化
- [ ] 组件懒加载

### 8. 测试与部署（Sprint 9）

- [ ] 单元测试
- [ ] E2E 测试
- [ ] 自动化部署
- [ ] 应用打包

## 📦 安装与使用

### 系统要求

- Windows 10+ / macOS 10.13+
- 内存 4GB 以上
- 硬盘空间 100MB 以上

### 安装步骤

1. 下载最新版本安装包
2. 运行安装程序
3. 根据提示完成安装

### 开发环境搭建

```bash
# 克
```
