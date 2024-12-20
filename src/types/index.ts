export type PromptType = 'cursor' | 'product'

// 产品需求提示词
export interface ProductPrompt {
  id: string
  title: string
  content: string
  directory: string
  category: string
  author: string
  authorUrl?: string
  authorAvatar?: string
  isSystem: boolean
  type: 'product'
  createTime?: number
  updateTime?: number
}

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
  type: 'cursor' | 'product'
}
