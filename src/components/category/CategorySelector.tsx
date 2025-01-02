import { usePromptStore } from '@/store/prompt'
import type { Category } from '@/types'

interface CategorySelectorProps {
  onSelect: (category: Category) => void
  onClose: () => void
}

const CategorySelector = ({ onSelect }: CategorySelectorProps) => {
  const { categories: allCategories } = usePromptStore()
  const categories = allCategories.filter(cat => !cat.isSystem)

  return (
    <div className="grid grid-cols-1 gap-2">
      {categories.map(category => (
        <div
          key={category.id}
          onClick={() => onSelect(category)}
          className="cursor-pointer hover:bg-gray-100 p-2 rounded flex items-center justify-between"
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelect(category)
            }
          }}
        >
          <span>{category.name}</span>
        </div>
      ))}
    </div>
  )
}

export default CategorySelector
