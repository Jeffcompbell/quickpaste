import type { ProductPrompt, Category } from '@/types'
import systemPrompts from './system-prompts.json'

// 系统分类定义
export const systemCategories: Category[] = [
  {
    id: 'requirement',
    name: '需求编写',
    type: 'product',
    order: 0,
    isSystem: true,
  },
  { id: 'debug', name: 'Bug修复', type: 'product', order: 1, isSystem: true },
  {
    id: 'deployment',
    name: 'Git部署',
    type: 'product',
    order: 2,
    isSystem: true,
  },
  {
    id: 'summary',
    name: '总结规范',
    type: 'product',
    order: 3,
    isSystem: true,
  },
]

// 处理提示词数据
const processPrompt = (prompt: ProductPrompt): ProductPrompt => {
  const processed = {
    ...prompt,
    createTime: Date.now(),
    updateTime: Date.now(),
    isSystem: true,
  }
  return processed
}

// 默认提示词列表
export const defaultPrompts: ProductPrompt[] = [
  ...systemPrompts.requirement,
  ...systemPrompts.debug,
  ...systemPrompts.deployment,
  ...systemPrompts.summary,
].map(prompt => processPrompt(prompt as ProductPrompt))

// 输出加载的提示词数量
console.log('Loaded system prompts:', {
  total: defaultPrompts.length,
  requirement: systemPrompts.requirement?.length || 0,
  debug: systemPrompts.debug?.length || 0,
  deployment: systemPrompts.deployment?.length || 0,
  summary: systemPrompts.summary?.length || 0,
})
