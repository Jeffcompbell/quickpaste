import { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react'
import { usePromptStore } from '@/store/prompt'
import { cn } from '@/lib/utils'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  PlusIcon,
  FolderIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from './icons'
import { toast } from 'react-hot-toast'

// 分离分类按钮组件以减少重渲染
const CategoryButton = memo(function CategoryButton({
  category,
  isActive,
  count,
  onClick,
  onEdit,
  onDelete,
  isSystem,
  isEditing,
  onEditSubmit,
}: {
  category: { id: string; name: string }
  isActive: boolean
  count: number
  onClick: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  isSystem?: boolean
  isEditing?: boolean
  onEditSubmit?: (id: string, newName: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  if (isEditing && onEditSubmit) {
    return (
      <div className="flex items-center w-full">
        <input
          ref={inputRef}
          type="text"
          defaultValue={category.name}
          onBlur={e => onEditSubmit(category.id, e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onEditSubmit(category.id, e.currentTarget.value)
            }
          }}
          onClick={e => e.stopPropagation()}
          className="flex-1 px-3 py-2 bg-transparent border-none focus:outline-none text-sm"
          autoFocus
        />
      </div>
    )
  }

  return (
    <div className="group flex items-center">
      <button
        onClick={onClick}
        className={cn(
          'category-button flex-1 flex items-center w-full px-3 py-2 text-sm rounded-md text-left',
          'transition-none',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-gray-600 hover:bg-accent hover:text-gray-900'
        )}
      >
        <span className="flex items-center flex-1">
          <FolderIcon className="w-4 h-4 mr-2" />
          {category.name}
          <span className="ml-auto text-xs text-gray-400">{count}</span>
        </span>
      </button>

      {!isSystem && onEdit && onDelete && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="absolute right-4 p-1 opacity-0 group-hover:opacity-100 hover:bg-accent rounded-md">
              <MoreHorizontalIcon className="w-4 h-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[160px] bg-white rounded-md shadow-md p-1">
              <DropdownMenu.Item
                onSelect={() => onEdit(category.id)}
                className="flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                重命名
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => onDelete(category.id)}
                className="flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer text-red-600"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                删除
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  )
})

// 分离分类列表组件以优化更新
const CategoryList = memo(function CategoryList({
  categories,
  activeCategory,
  count,
  onClick,
  onEdit,
  onDelete,
  isSystem,
  editingCategory,
  onEditSubmit,
}: {
  categories: Array<{ id: string; name: string }>
  activeCategory: string | null
  count: (id: string) => number
  onClick: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  isSystem?: boolean
  editingCategory?: string | null
  onEditSubmit?: (id: string, newName: string) => void
}) {
  return (
    <div className="mt-1 space-y-0.5">
      {categories.map(category => (
        <CategoryButton
          key={category.id}
          category={category}
          isActive={activeCategory === category.id}
          count={count(category.id)}
          onClick={() => onClick(category.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          isSystem={isSystem}
          isEditing={editingCategory === category.id}
          onEditSubmit={onEditSubmit}
        />
      ))}
    </div>
  )
})

export function CategorySidebar() {
  const activeCategory = usePromptStore(state => state.activeCategory)
  const setActiveCategory = usePromptStore(state => state.setActiveCategory)
  const categories = usePromptStore(state => state.categories)
  const prompts = usePromptStore(state => state.prompts)
  const addCategory = usePromptStore(state => state.addCategory)
  const updateCategory = usePromptStore(state => state.updateCategory)
  const deleteCategory = usePromptStore(state => state.deleteCategory)

  // 记忆化分类数量计算
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const prompt of prompts) {
      counts[prompt.category] = (counts[prompt.category] || 0) + 1
    }
    return counts
  }, [prompts])

  // 记忆化分类分离
  const { systemCategories, userCategories } = useMemo(
    () => ({
      systemCategories: categories.filter(cat => cat.isSystem),
      userCategories: categories.filter(cat => !cat.isSystem),
    }),
    [categories]
  )

  // 记忆化获取分类数量的函数
  const getCategoryCount = useCallback(
    (categoryId: string) => categoryCounts[categoryId] || 0,
    [categoryCounts]
  )

  // 记忆化切换分类的函数
  const handleCategoryClick = useCallback(
    (categoryId: string | null) => {
      setActiveCategory(categoryId)
    },
    [setActiveCategory]
  )

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)

  // 处理添加分类
  const handleAddCategory = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!newCategoryName.trim()) return

      addCategory({
        id: `custom-${Date.now()}`,
        name: newCategoryName.trim(),
        type: 'product',
        order: categories.length,
        isSystem: false,
      })

      setNewCategoryName('')
      setShowAddDialog(false)
    },
    [newCategoryName, categories.length, addCategory]
  )

  // 处理编辑分类
  const handleEditCategory = useCallback(
    (categoryId: string, newName: string) => {
      if (!newName.trim()) return
      updateCategory(categoryId, { name: newName.trim() })
      setEditingCategory(null)
    },
    [updateCategory]
  )

  // 处理删除分类
  const handleDeleteCategory = useCallback(
    (categoryId: string) => {
      const hasPrompts = prompts.some(prompt => prompt.category === categoryId)
      if (hasPrompts) {
        toast.error('无法删除非空分类')
        return
      }

      if (confirm('确定要删除这个自定义分类吗？此操作无法撤销。')) {
        deleteCategory(categoryId)
      }
    },
    [prompts, deleteCategory]
  )

  return (
    <div className="w-64 border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">目录</h2>
          <Dialog.Root open={showAddDialog} onOpenChange={setShowAddDialog}>
            <Dialog.Trigger asChild>
              <button className="w-4 h-4 text-gray-500 hover:text-gray-700">
                <PlusIcon className="w-4 h-4" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white rounded-lg shadow-lg p-4">
                <Dialog.Title className="text-lg font-semibold mb-4">
                  添加分类
                </Dialog.Title>
                <form onSubmit={handleAddCategory}>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md mb-4"
                    placeholder="请输入分类名称"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm border rounded-md"
                      >
                        取消
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md"
                    >
                      确定
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <div className="space-y-4">
          {/* 全部 */}
          <div className="bg-gray-50/50 rounded-md">
            <CategoryButton
              category={{ id: 'all', name: '全部' }}
              isActive={!activeCategory}
              count={prompts.length}
              onClick={() => handleCategoryClick(null)}
            />
          </div>

          {/* 系统分类 */}
          <div>
            <div className="text-xs text-gray-500">系统分类</div>
            <CategoryList
              categories={systemCategories}
              activeCategory={activeCategory}
              count={getCategoryCount}
              onClick={handleCategoryClick}
              isSystem={true}
            />
          </div>

          {/* 用户分类 */}
          {userCategories.length > 0 && (
            <div>
              <div className="text-xs text-gray-500">自定义分类</div>
              <CategoryList
                categories={userCategories}
                activeCategory={activeCategory}
                count={getCategoryCount}
                onClick={handleCategoryClick}
                onEdit={setEditingCategory}
                onDelete={handleDeleteCategory}
                editingCategory={editingCategory}
                onEditSubmit={handleEditCategory}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
