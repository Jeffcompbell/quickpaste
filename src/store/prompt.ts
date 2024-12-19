import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Prompt, CursorPrompt, ProductPrompt, Category } from '@/types'

export type { Prompt }

interface PromptStore {
  prompts: Prompt[]
  activeCategory: string
  categories: Category[]
  isCompact: boolean
  addPrompt: (
    prompt: Omit<CursorPrompt, 'id'> | Omit<ProductPrompt, 'id'>
  ) => void
  editPrompt: (prompt: Prompt) => void
  deletePrompt: (id: string) => void
  reorderPrompt: (fromId: string, toId: string) => void
  setActiveCategory: (id: string) => void
  toggleCompact: () => void
  reorderCategory: (fromId: string, toId: string) => void
}

const defaultCategories: Category[] = [
  {
    id: 'cursor-chat',
    name: 'Cursor 对话',
    type: 'cursor',
    order: 0,
  },
  {
    id: 'cursor-product',
    name: 'Cursor 产品',
    type: 'product',
    order: 1,
  },
]

// 对话提示词的 mock 数据
const mockCursorPrompts: Omit<CursorPrompt, 'id'>[] = [
  // 默认目录
  ...Array.from({ length: 4 }).map((_, i) => ({
    type: 'cursor' as const,
    title: `默认目录示例 ${i + 1}`,
    content: `这是默认目录的快捷回复示例，你可以快速复制这段文本。这是第 ${i + 1} 条示例数据。`,
    category: 'cursor-chat',
    directory: 'default',
    order: i,
  })),
  // 代码片段目录
  ...Array.from({ length: 3 }).map((_, i) => ({
    type: 'cursor' as const,
    title: `代码片段示例 ${i + 1}`,
    content: `// 这是代码片段示例 ${i + 1}\nfunction example() {\n  console.log('Hello World');\n}`,
    category: 'cursor-chat',
    directory: 'code',
    order: i + 4,
  })),
  // 文本模板目录
  ...Array.from({ length: 3 }).map((_, i) => ({
    type: 'cursor' as const,
    title: `文本模板示例 ${i + 1}`,
    content: `这是一个文本模板示例，可以用于常用文本的快速输入。这是第 ${i + 1} 条示例数据。`,
    category: 'cursor-chat',
    directory: 'text',
    order: i + 7,
  })),
]

// 产品提示词的 mock 数据
const mockProductPrompts: Omit<ProductPrompt, 'id'>[] = [
  // 前端开发目录
  ...Array.from({ length: 4 }).map((_, i) => ({
    type: 'product' as const,
    title: `前端开发需求 ${i + 1}`,
    content: `这是一个前端开发需求示例，描述了一个前端功能的实现要求。\n\n功能描述：\n1. 实现响应式布局\n2. 支持暗色模式\n3. 优化加载性能\n\n这是第 ${i + 1} 条示例数据。`,
    category: 'cursor-product',
    directory: 'frontend',
    author: `前端开发者 ${i + 1}`,
    authorAvatar: `https://api.dicebear.com/7.x/avatars/svg?seed=frontend${i}`,
    authorUrl: `https://github.com/frontend-author${i + 1}`,
  })),
  // 后端开发目录
  ...Array.from({ length: 3 }).map((_, i) => ({
    type: 'product' as const,
    title: `后端开发需求 ${i + 1}`,
    content: `这是一个后端开发需求示例，描述了一个API接口的实现要求。\n\n接口要求：\n1. RESTful API设计\n2. 数据验证\n3. 错误处理\n\n这是第 ${i + 1} 条示例数据。`,
    category: 'cursor-product',
    directory: 'backend',
    author: `后端开发者 ${i + 1}`,
    authorAvatar: `https://api.dicebear.com/7.x/avatars/svg?seed=backend${i}`,
    authorUrl: `https://github.com/backend-author${i + 1}`,
  })),
  // 移动开发目录
  ...Array.from({ length: 3 }).map((_, i) => ({
    type: 'product' as const,
    title: `移动开发需求 ${i + 1}`,
    content: `这是一个移动开发需求示例，描述了一个移动端功能的实现要求。\n\n功能要求：\n1. 原生性能优化\n2. 手势交互\n3. 离线存储\n\n这是第 ${i + 1} 条示例数据。`,
    category: 'cursor-product',
    directory: 'mobile',
    author: `移动开发者 ${i + 1}`,
    authorAvatar: `https://api.dicebear.com/7.x/avatars/svg?seed=mobile${i}`,
    authorUrl: `https://github.com/mobile-author${i + 1}`,
  })),
]

export const usePromptStore = create<PromptStore>()(
  persist(
    set => ({
      prompts: [
        ...mockCursorPrompts.map(p => ({ ...p, id: crypto.randomUUID() })),
        ...mockProductPrompts.map(p => ({ ...p, id: crypto.randomUUID() })),
      ],
      categories: defaultCategories,
      activeCategory: 'cursor-chat',
      isCompact: false,
      addPrompt: prompt =>
        set(state => ({
          prompts: [
            ...state.prompts,
            {
              ...prompt,
              id: crypto.randomUUID(),
            },
          ],
        })),
      editPrompt: prompt =>
        set(state => ({
          prompts: state.prompts.map(p => (p.id === prompt.id ? prompt : p)),
        })),
      deletePrompt: id =>
        set(state => ({
          prompts: state.prompts.filter(p => p.id !== id),
        })),
      reorderPrompt: (fromId, toId) =>
        set(state => {
          const prompts = [...state.prompts]
          const fromIndex = prompts.findIndex(p => p.id === fromId)
          const toIndex = prompts.findIndex(p => p.id === toId)

          // 只对 cursor 类型的提示词进行排序
          if (prompts[fromIndex].type !== 'cursor') return { prompts }

          const [removed] = prompts.splice(fromIndex, 1)
          prompts.splice(toIndex, 0, removed)

          // 更新顺序
          const cursorPrompts = prompts.filter(p => p.type === 'cursor')
          cursorPrompts.forEach((p, i) => {
            p.order = i
          })

          return { prompts }
        }),
      setActiveCategory: id => set({ activeCategory: id }),
      toggleCompact: () => set(state => ({ isCompact: !state.isCompact })),
      reorderCategory: (fromId, toId) =>
        set(state => {
          const categories = [...state.categories]
          const fromIndex = categories.findIndex(c => c.id === fromId)
          const toIndex = categories.findIndex(c => c.id === toId)

          const [removed] = categories.splice(fromIndex, 1)
          categories.splice(toIndex, 0, removed)

          // 更新顺序
          categories.forEach((c, i) => {
            c.order = i
          })

          return { categories }
        }),
    }),
    {
      name: 'prompt-storage',
      version: 1,
    }
  )
)
