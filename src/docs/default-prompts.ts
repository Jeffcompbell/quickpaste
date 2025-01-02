import type { Prompt, SystemCategory } from './prompt-types'

/**
 * 默认提示词数据
 */
export const defaultPrompts: Prompt[] = [
  {
    id: 'default-1',
    title: '代码审查',
    content: '请帮我审查以下代码，指出潜在的问题和改进建议...',
    category: 'debug' as SystemCategory,
    author: 'System',
    isSystem: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-2',
    title: '代码优化',
    content: '请帮我优化以下代码，提高性能和可维护性...',
    category: 'debug' as SystemCategory,
    author: 'System',
    isSystem: true,
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
