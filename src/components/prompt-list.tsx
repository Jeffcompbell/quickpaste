import { useMemo } from 'react'
import { usePromptStore } from '@/store/prompt'
import type { ProductPrompt } from '@/types'
import { useWindowDimensions } from '@/hooks/use-window-dimensions'
import { ProductPromptCard } from './product-prompt-card'

interface PromptListProps {
  category: string
}

export function PromptList({ category }: PromptListProps) {
  const { width } = useWindowDimensions()
  const { prompts } = usePromptStore()

  // 根据分类筛选提示词
  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => prompt.category === category)
  }, [prompts, category])

  // 计算产品提示词的卡片布局
  const cardsPerRow = useMemo(() => {
    const availableWidth = width - 64 - 224 // 考虑左右边距和侧边栏宽度
    const minCardsWidth = 300
    const gap = 24
    const count = Math.floor((availableWidth + gap) / (minCardsWidth + gap))
    return Math.max(1, Math.min(3, count))
  }, [width])

  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))`,
      }}
    >
      {filteredPrompts.map(prompt => (
        <ProductPromptCard key={prompt.id} prompt={prompt as ProductPrompt} />
      ))}
    </div>
  )
}
