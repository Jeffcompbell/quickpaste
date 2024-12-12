import { cn } from '@/lib/utils'
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { usePromptStore } from '@/store/prompt'
import { SortableItem } from './sortable-item'

export function CategoryList() {
  const sensors = useSensors(useSensor(PointerSensor))
  const { categories, reorderCategory, activeCategory, setActiveCategory } =
    usePromptStore()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderCategory(active.id as string, over.id as string)
    }
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
                onClick={() => setActiveCategory(category.id)}
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
