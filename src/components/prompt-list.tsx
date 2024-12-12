import { useCallback, useState, useMemo, useEffect } from 'react'
import { usePromptStore, type Prompt } from '@/store/prompt'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { MoreHorizontalIcon, CopyIcon, EditIcon, TrashIcon } from './icons'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { PromptEditDialog } from './prompt-edit-dialog'
import { getElectronAPI } from '@/lib/electron'
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from './sortable-item'

interface PromptListProps {
  directory?: string
  isCompact?: boolean
}

export function PromptList({ directory, isCompact }: PromptListProps) {
  const {
    prompts,
    deletePrompt,
    activeCategory,
    reorderPrompt,
    movePromptToCategory,
  } = usePromptStore()
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [isPinned, setIsPinned] = useState(false)
  const electron = getElectronAPI()
  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    electron.window.getPinState().then(setIsPinned)
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    if (active.id !== over.id) {
      if (over.data.current?.type === 'category') {
        // 跨分组拖动
        movePromptToCategory(active.id as string, over.id as string)
      } else {
        // 同分组内排序
        reorderPrompt(active.id as string, over.id as string, activeCategory)
      }
    }
  }

  const filteredPrompts = useMemo(
    () =>
      prompts
        .filter(
          prompt =>
            prompt.category === activeCategory &&
            (!directory || prompt.directory === directory)
        )
        .sort((a, b) => a.order - b.order),
    [prompts, activeCategory, directory]
  )

  const handleCopy = useCallback(
    (content: string) => {
      electron.clipboard.writeText(content)
      toast.success('已复制到剪贴板')
      if (!isPinned) {
        setTimeout(() => {
          electron.window.hide()
        }, 100)
      }
    },
    [isPinned]
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm('确定要删除这个提示词吗？')) {
        deletePrompt(id)
        toast.success('删除成功')
      }
    },
    [deletePrompt]
  )

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
        <p>暂无提示词</p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext
        items={filteredPrompts}
        strategy={verticalListSortingStrategy}
      >
        <div className="h-full overflow-y-auto">
          <div className="space-y-2 pr-2">
            {filteredPrompts.map(prompt => (
              <SortableItem key={prompt.id} id={prompt.id}>
                <div
                  className={cn(
                    'p-4 rounded-lg border border-border/50',
                    'hover:border-border cursor-pointer group'
                  )}
                  onClick={() => handleCopy(prompt.content)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{prompt.title}</h3>
                    {!isCompact && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent"
                            onClick={e => e.stopPropagation()}
                          >
                            <MoreHorizontalIcon className="w-4 h-4" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content className="min-w-[160px] bg-popover text-popover-foreground rounded-md p-1 shadow-md">
                            <DropdownMenu.Item
                              className="flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer"
                              onClick={e => {
                                e.stopPropagation()
                                handleCopy(prompt.content)
                              }}
                            >
                              <CopyIcon className="w-4 h-4 mr-2" />
                              复制
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer"
                              onClick={e => {
                                e.stopPropagation()
                                setEditingPrompt(prompt)
                              }}
                            >
                              <EditIcon className="w-4 h-4 mr-2" />
                              编辑
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              className="flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer text-destructive"
                              onClick={e => {
                                e.stopPropagation()
                                handleDelete(prompt.id)
                              }}
                            >
                              <TrashIcon className="w-4 h-4 mr-2" />
                              删除
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    )}
                  </div>
                  {!isCompact && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {prompt.content}
                    </p>
                  )}
                </div>
              </SortableItem>
            ))}
            {!isCompact && editingPrompt && (
              <PromptEditDialog
                prompt={editingPrompt}
                open={!!editingPrompt}
                onOpenChange={open => !open && setEditingPrompt(null)}
              />
            )}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  )
}
