export type PromptType = 'cursor' | 'product'

// 基础提示词类型
interface BasePrompt {
  id: string
  type: PromptType
  category: string
  content: string
  directory?: string
  author?: string
  authorAvatar?: string
  authorUrl?: string
}

// 快捷复制对话提示词
export interface CursorPrompt extends BasePrompt {
  type: 'cursor'
  title: string
  order: number // 用于排序
}

// 产品需求提示词
export interface ProductPrompt extends BasePrompt {
  type: 'product'
  title: string
  author: string
  authorAvatar: string
  authorUrl: string
  order: number // 添加 order 属性用于排序
}

export type Prompt = CursorPrompt | ProductPrompt
export interface Category {
  id: string
  name: string
  type: PromptType
  order: number
}

export interface Directory {
  id: string
  name: string
  icon?: React.ReactNode
  type: 'cursor' | 'product' // 区分不同类型的目录
}
