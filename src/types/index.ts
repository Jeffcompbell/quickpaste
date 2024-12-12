export interface Prompt {
  id: string
  type: 'cursor' | 'system' | 'prd'
  category: string
  content: string
  variables?: string[]
  tags?: string[]
}

export interface Category {
  id: string
  name: string
  type: 'cursor' | 'system' | 'prd'
}
