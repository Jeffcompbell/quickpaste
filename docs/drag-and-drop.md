# 拖拽排序功能实现文档

## 功能需求

1. 分组拖拽排序

   - 分组之间可以上下拖动调整顺序
   - 保存排序后的顺序到本地存储

2. 提示词拖拽
   - 提示词可以在同一分组内上下拖动排序
   - 提示词可以跨分组拖动
   - 拖动时显示视觉反馈
   - 保存排序和分组变更到本地存储

## 技术实现

### 1. 依赖安装

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. 状态管理扩展

```typescript
// src/store/prompt.ts
interface Category {
  id: string
  name: string
  order: number // 新增排序字段
}

interface Prompt {
  id: string
  title: string
  content: string
  category: string
  order: number // 新增排序字段
  // ... 其他字段
}

interface PromptStore {
  // ... 现有字段
  reorderCategory: (activeId: string, overId: string) => void
  reorderPrompt: (activeId: string, overId: string, category: string) => void
  movePromptToCategory: (promptId: string, categoryId: string) => void
}
```

### 3. 分组拖拽实现

```typescript
// src/components/category-list.tsx
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export function CategoryList() {
  const sensors = useSensors(useSensor(PointerSensor))
  const { categories, reorderCategory } = usePromptStore()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderCategory(active.id as string, over.id as string)
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={categories} strategy={verticalListSortingStrategy}>
        {categories.map(category => (
          <SortableCategory key={category.id} category={category} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### 4. 提示词拖拽实现

```typescript
// src/components/prompt-list.tsx
export function PromptList({ category }: { category: string }) {
  const { prompts, reorderPrompt, movePromptToCategory } = usePromptStore()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    if (active.id !== over.id) {
      if (over.data.current?.type === 'category') {
        // 跨分组拖动
        movePromptToCategory(active.id as string, over.id as string)
      } else {
        // 同分组内排序
        reorderPrompt(active.id as string, over.id as string, category)
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={prompts} strategy={verticalListSortingStrategy}>
        {prompts.map(prompt => (
          <SortablePrompt key={prompt.id} prompt={prompt} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### 5. 拖拽样式

```typescript
// src/components/sortable-item.tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  id: string
  children: React.ReactNode
}

export function SortableItem({ id, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}
```

## 实现步骤

1. 更新数据模型

   - 为分组和提示词添加 order 字段
   - 实现排序和移动的状态更新函数

2. 实现拖拽组件

   - 创建可排序的分组组件
   - 创建可排序的提示词组件
   - 添加拖拽时的视觉反馈

3. 集成到现有组件

   - 在分组列表中集成拖拽功能
   - 在提示词列表中集成拖拽功能
   - 处理跨分组拖拽

4. 持久化存储
   - 保存排序结果到本地存储
   - 在加载时恢复排序状态

## 注意事项

1. 性能优化

   - 使用 memo 优化渲染
   - 避免不必要的状态更新

2. 用户体验

   - 添加拖拽时的动画效果
   - 提供清晰的视觉反馈
   - 考虑触摸设备的支持

3. 错误处理

   - 处理拖拽过程中的异常
   - 确保数据一致性

4. 辅助功能
   - 添加键盘导航支持
   - 提供适当的 ARIA 属性
