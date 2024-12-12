import { type Prompt } from './prompt-types'

/**
 * 默认提示词数据
 */
export const defaultPrompts: Prompt[] = [
  {
    id: crypto.randomUUID(),
    title: 'TypeScript 代码审查',
    content: `请帮我审查以下 TypeScript 代码，重点关注：
1. 类型定义的准确性和完整性
2. 代码结构和组织方式
3. 潜在的性能问题
4. 可能的安全隐患
5. 是否符合最佳实践

请提供具体的改进建议。`,
    category: 'cursor-chat',
    directory: 'default',
    order: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    title: 'React Native 性能优化',
    content: `请帮我分析以下 React Native 代码的性能问题，包括：
1. 组件重渲染优化
2. useCallback 和 useMemo 的使用
3. 列表性能优化
4. 图片加载优化
5. 动画性能优化

请给出具体的优化建议和示例代码。`,
    category: 'cursor-product',
    directory: 'default',
    order: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: crypto.randomUUID(),
    title: 'AI 助手系统提示词',
    content: `你是一位专业的软件开发助手，专注于 TypeScript、React Native 和 Expo 开发。
请遵循以下原则：

1. 代码风格：
- 使用 TypeScript 的严格模式
- 优先使用函数式组件和 Hooks
- 遵循 ESLint 和 Prettier 规范

2. 性能考虑：
- 优化重渲染
- 合理使用缓存
- 注意内存泄漏

3. 最佳实践：
- 组件职责单一
- 状态管理清晰
- 错误处理完善

请基于这些原则提供建议和代码示例。`,
    category: 'system-prompt',
    directory: 'default',
    order: 2,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

/**
 * 使用示例：
 *
 * // 在 store 初始化时加载默认提示词
 * const store = create<PromptStore>((set) => ({
 *   prompts: defaultPrompts,
 *   // ... 其他 store 配置
 * }))
 */
