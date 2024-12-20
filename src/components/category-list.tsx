import { cn } from '@/lib/utils'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { usePromptStore } from '@/store/prompt'
import type { Category } from '@/types'

function SortableItem({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
      }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

interface CategoryListProps {
  categories: Category[]
  activeCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export function CategoryList({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryListProps) {
  const sensors = useSensors(useSensor(PointerSensor))
  const { reorderCategory } = usePromptStore()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const oldIndex = categories.findIndex(cat => cat.id === active.id)
    const newIndex = categories.findIndex(cat => cat.id === over.id)
    reorderCategory(oldIndex, newIndex)
  }

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext
        items={sortedCategories}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
          {sortedCategories.map(category => (
            <SortableItem key={category.id} id={category.id}>
              <button
                className={cn(
                  'w-full px-2 py-1.5 text-sm rounded-md text-left',
                  'hover:bg-accent',
                  activeCategory === category.id && 'bg-accent'
                )}
                onClick={() => onCategoryChange(category.id)}
              >
                {category.name}
              </button>
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
