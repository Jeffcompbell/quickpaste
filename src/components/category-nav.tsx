import { cn } from '@/lib/utils'
import { type Prompt } from '@/store/prompt'

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
  activeCategory: Prompt['category']
  onChange: (category: Prompt['category']) => void
}

export function CategoryNav({ activeCategory, onChange }: CategoryNavProps) {
  return (
    <nav className="flex space-x-1 bg-muted/50 p-1 rounded-lg">
      {categories.map(category => (
        <button
          key={category.id}
          className={cn(
            'flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            'hover:bg-background/80',
            activeCategory === category.id
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground'
          )}
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </nav>
  )
}
