import { cn } from '@/lib/utils'
import { usePromptStore } from '@/store/prompt'
import type { ProductPrompt } from '@/types'

const categories = [
  {
    id: 'cursor-chat' as const,
    name: 'Cursor 对话',
    description: '用于 Cursor AI 对话的提示词',
  },
  {
    id: 'cursor-product' as const,
    name: 'Cursor 产品',
    description: '用于 Cursor 产品功能的提示词',
  },
  {
    id: 'system-prompt' as const,
    name: 'System Prompt',
    description: '系统级提示词',
  },
] as const

interface CategoryNavProps {
  activeCategory: ProductPrompt['category']
  onChange: (category: ProductPrompt['category']) => void
}

export function CategoryNav({ activeCategory, onChange }: CategoryNavProps) {
  return (
    <div
      className="flex items-center h-12 
                 bg-white border-b border-neutral-200"
    >
      <nav className="inline-flex rounded-lg bg-neutral-100/50">
        {categories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => onChange(category.id)}
            className={cn(
              'relative px-4 h-8 text-sm transition-all duration-150',
              // Notion 风格的文本颜色
              'text-neutral-500 hover:text-neutral-800',
              // 选中状态
              activeCategory === category.id && 'text-neutral-900 font-medium',
              // 分隔线
              index !== categories.length - 1 &&
                activeCategory !== category.id &&
                activeCategory !== categories[index + 1]?.id &&
                'border-r border-neutral-200'
            )}
          >
            {activeCategory === category.id && (
              <div
                className="absolute inset-0 
                          bg-white
                          rounded-lg
                          shadow-sm"
              />
            )}
            <span className="relative z-10">{category.name}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
