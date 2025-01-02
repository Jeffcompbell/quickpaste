export type PromptType = 'cursor' | 'product'

// 产品需求提示词
export interface ProductPrompt {
  id: string
  title: string
  content: string
  category: string
  type: 'product'
  author: string
  authorUrl?: string
  createTime: number
  updateTime: number
  isSystem?: boolean
}

// 统一的分类接口
export interface Category {
  id: string
  name: string
  type: PromptType
  order: number
  isSystem?: boolean
}
