import { useMemo, useState } from 'react'
import { usePromptStore } from '@/store/prompt'
import type { ProductPrompt } from '@/types'
import { useWindowDimensions } from '@/hooks/use-window-dimensions'
import { ProductPromptCard } from './product-prompt-card'
import { PromptEditForm } from './prompt-edit-form'
import * as Dialog from '@radix-ui/react-dialog'
import { cursorDirectories } from '@/config/directories'
import { toast } from 'react-hot-toast'

interface PromptListProps {
  prompts: ProductPrompt[] // 接收从父组件传入的已过滤的prompts
}

export function PromptList({ prompts }: PromptListProps) {
  const { width } = useWindowDimensions()
  const { updatePrompt } = usePromptStore()
  const [editingPrompt, setEditingPrompt] = useState<ProductPrompt | null>(null)
  const [movingPrompt, setMovingPrompt] = useState<ProductPrompt | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // 计算产品提示词的卡片布局
  const cardsPerRow = useMemo(() => {
    const availableWidth = width - 64 - 224 // 考虑左右边距和侧边栏宽度
    const minCardsWidth = 300
    const gap = 24
    const count = Math.floor((availableWidth + gap) / (minCardsWidth + gap))
    return Math.max(1, Math.min(3, count))
  }, [width])

  const handleEdit = (prompt: ProductPrompt) => {
    setEditingPrompt(prompt)
  }

  const handleMove = (prompt: ProductPrompt) => {
    setMovingPrompt(prompt)
    setSelectedCategory(prompt.category)
  }

  const handleMoveConfirm = () => {
    if (movingPrompt && selectedCategory) {
      updatePrompt({
        ...movingPrompt,
        category: selectedCategory,
      })
      setMovingPrompt(null)
      setSelectedCategory('')
      toast.success('已移动到新目录', {
        duration: 1500,
        position: 'top-center',
        style: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      })
    }
  }

  const handleDelete = () => {
    // 删除功能已在 ProductPromptCard 中实现
  }

  return (
    <>
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${cardsPerRow}, minmax(0, 1fr))`,
        }}
      >
        {prompts.map(prompt => (
          <ProductPromptCard
            key={prompt.id}
            prompt={prompt}
            onEdit={handleEdit}
            onMove={handleMove}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* 编辑对话框 */}
      <Dialog.Root
        open={!!editingPrompt}
        onOpenChange={open => {
          if (!open) {
            setEditingPrompt(null)
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200"
            aria-describedby="edit-dialog-description"
          >
            <div className="p-6">
              <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
                编辑提示词
              </Dialog.Title>
              <Dialog.Description
                id="edit-dialog-description"
                className="sr-only"
              >
                编辑提示词的标题、内容和作者信息
              </Dialog.Description>
              {editingPrompt && (
                <PromptEditForm
                  prompt={editingPrompt}
                  onClose={() => setEditingPrompt(null)}
                />
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 移动对话框 */}
      <Dialog.Root
        open={!!movingPrompt}
        onOpenChange={open => {
          if (!open) {
            setMovingPrompt(null)
            setSelectedCategory('')
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200"
            aria-describedby="move-dialog-description"
          >
            <div className="p-6">
              <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
                移动到
              </Dialog.Title>
              <Dialog.Description
                id="move-dialog-description"
                className="sr-only"
              >
                选择要将提示词移动到的目标目录
              </Dialog.Description>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900"
              >
                <option value="" disabled>
                  选择目标分类
                </option>
                {cursorDirectories.map(dir => (
                  <option key={dir.id} value={dir.id}>
                    {dir.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
              <Dialog.Close asChild>
                <button className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  取消
                </button>
              </Dialog.Close>
              <button
                onClick={handleMoveConfirm}
                disabled={!selectedCategory}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确定
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
