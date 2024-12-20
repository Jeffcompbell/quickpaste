import type { ProductPrompt } from '@/types'
import systemPrompts from './system-prompts.json'

// 处理时间戳
const processPrompt = (prompt: ProductPrompt): ProductPrompt => {
  if (prompt.type !== 'product') {
    throw new Error(`Invalid prompt type: ${prompt.type}`)
  }

  return {
    ...prompt,
    type: 'product' as const,
    createTime: Date.now(),
    updateTime: Date.now(),
  }
}

// 合并所有系统提示词
export const defaultPrompts: ProductPrompt[] = [
  ...systemPrompts.requirement.map(prompt =>
    processPrompt(prompt as ProductPrompt)
  ),
  ...systemPrompts.debug.map(prompt => processPrompt(prompt as ProductPrompt)),
  ...systemPrompts.deployment.map(prompt =>
    processPrompt(prompt as ProductPrompt)
  ),
  ...systemPrompts.summary.map(prompt =>
    processPrompt(prompt as ProductPrompt)
  ),
]

// 添加日志检查加载的提示词
console.log('Loaded prompts:', {
  requirement: systemPrompts.requirement.length,
  debug: systemPrompts.debug.length,
  deployment: systemPrompts.deployment.length,
  summary: systemPrompts.summary.length,
})
