import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultPrompts: Prompt[] = [
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
    content: `你是一��的软件开发助手，专注于 TypeScript、React Native 和 Expo 开发。
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

const defaultCategories: Category[] = [
  {
    id: 'cursor-chat',
    name: '对话提示词',
    order: 0,
  },
  {
    id: 'cursor-product',
    name: '产品提示词',
    order: 1,
  },
  {
    id: 'system-prompt',
    name: '系统提示词',
    order: 2,
  },
]

export interface Category {
  id: string
  name: string
  order: number
}

export interface Prompt {
  id: string
  title: string
  content: string
  category: string
  directory?: string
  order: number
  createdAt: number
  updatedAt: number
}

interface PromptStore {
  prompts: Prompt[]
  categories: Category[]
  activeCategory: string
  isCompact: boolean
  addPrompt: (
    prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'order'>
  ) => void
  updatePrompt: (id: string, prompt: Partial<Prompt>) => void
  deletePrompt: (id: string) => void
  addCategory: (name: string) => void
  deleteCategory: (id: string) => void
  setActiveCategory: (id: string) => void
  toggleCompact: () => void
  reorderCategory: (activeId: string, overId: string) => void
  reorderPrompt: (activeId: string, overId: string, category: string) => void
  movePromptToCategory: (promptId: string, categoryId: string) => void
}

export const usePromptStore = create(
  persist<PromptStore>(
    (set, get) => ({
      prompts: defaultPrompts,
      categories: defaultCategories,
      activeCategory: 'cursor-chat',
      isCompact: false,

      addPrompt: prompt => {
        const prompts = get().prompts
        const maxOrder = Math.max(
          0,
          ...prompts
            .filter(p => p.category === prompt.category)
            .map(p => p.order)
        )

        set(state => ({
          prompts: [
            ...state.prompts,
            {
              ...prompt,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
              order: maxOrder + 1,
            },
          ],
        }))
      },

      updatePrompt: (id, prompt) =>
        set(state => ({
          prompts: state.prompts.map(p =>
            p.id === id ? { ...p, ...prompt, updatedAt: Date.now() } : p
          ),
        })),

      deletePrompt: id =>
        set(state => ({
          prompts: state.prompts.filter(p => p.id !== id),
        })),

      addCategory: name =>
        set(state => {
          const maxOrder = Math.max(0, ...state.categories.map(c => c.order))
          const newId = crypto.randomUUID()
          return {
            categories: [
              ...state.categories,
              {
                id: newId,
                name,
                order: maxOrder + 1,
              },
            ],
          }
        }),

      deleteCategory: id =>
        set(state => ({
          categories: state.categories.filter(c => c.id !== id),
        })),

      setActiveCategory: id => set({ activeCategory: id }),

      toggleCompact: () => set(state => ({ isCompact: !state.isCompact })),

      reorderCategory: (activeId, overId) => {
        set(state => {
          const categories = [...state.categories]
          const activeIndex = categories.findIndex(c => c.id === activeId)
          const overIndex = categories.findIndex(c => c.id === overId)

          if (activeIndex === -1 || overIndex === -1) return state

          const [activeItem] = categories.splice(activeIndex, 1)
          categories.splice(overIndex, 0, activeItem)

          // 更新所有分类的顺序
          return {
            categories: categories.map((category, index) => ({
              ...category,
              order: index,
            })),
          }
        })
      },

      reorderPrompt: (activeId, overId, category) => {
        set(state => {
          const prompts = [...state.prompts]
          const categoryPrompts = prompts.filter(p => p.category === category)

          const activeIndex = categoryPrompts.findIndex(p => p.id === activeId)
          const overIndex = categoryPrompts.findIndex(p => p.id === overId)

          if (activeIndex === -1 || overIndex === -1) return state

          const [activeItem] = categoryPrompts.splice(activeIndex, 1)
          categoryPrompts.splice(overIndex, 0, activeItem)

          // 更新当前分类中所有提示词的顺序
          const updatedPrompts = prompts.map(prompt => {
            if (prompt.category !== category) return prompt
            const index = categoryPrompts.findIndex(p => p.id === prompt.id)
            return {
              ...prompt,
              order: index,
            }
          })

          return { prompts: updatedPrompts }
        })
      },

      movePromptToCategory: (promptId, categoryId) => {
        set(state => {
          const prompts = [...state.prompts]
          const promptIndex = prompts.findIndex(p => p.id === promptId)

          if (promptIndex === -1) return state

          const maxOrder = Math.max(
            0,
            ...prompts.filter(p => p.category === categoryId).map(p => p.order)
          )

          prompts[promptIndex] = {
            ...prompts[promptIndex],
            category: categoryId,
            order: maxOrder + 1,
          }

          return { prompts }
        })
      },
    }),
    {
      name: 'prompt-storage',
    }
  )
)
