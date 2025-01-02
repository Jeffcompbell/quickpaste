import { useState, useEffect, useCallback } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { usePromptStore } from '@/store/prompt'
import type { ProductPrompt } from '@/types'
import { toast } from 'react-hot-toast'
import { CloseIcon } from './icons'

interface PromptEditDialogProps {
  prompt?: ProductPrompt
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (editedPrompt: ProductPrompt) => void | Promise<void>
}

export function PromptEditDialog({
  prompt,
  open,
  onOpenChange,
  onSave,
}: PromptEditDialogProps) {
  const [formState, setFormState] = useState({
    title: '',
    content: '',
    category: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { categories: allCategories } = usePromptStore()
  const categories = allCategories.filter(cat => !cat.isSystem)

  // 同步表单状态
  useEffect(() => {
    if (open && prompt) {
      setFormState({
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
      })
    }
  }, [open, prompt])

  // 处理对话框关闭后的 DOM 清理
  useEffect(() => {
    if (!open) {
      const cleanup = () => {
        // 移除所有可能的遮罩层
        const overlays = document.querySelectorAll('[data-radix-portal]')
        overlays.forEach(overlay => {
          if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay)
          }
        })
        // 恢复页面交互
        document.body.style.pointerEvents = ''
        document.body.style.overflow = ''
      }

      // 延迟执行清理，确保动画完成
      const timer = setTimeout(cleanup, 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (isSubmitting || !prompt || !onSave) return

      const trimmedTitle = formState.title.trim()
      const trimmedContent = formState.content.trim()

      if (!trimmedTitle || !trimmedContent || !formState.category) {
        toast.error('请填写所有必填字段')
        return
      }

      try {
        setIsSubmitting(true)
        const editedPrompt: ProductPrompt = {
          ...prompt,
          title: trimmedTitle,
          content: trimmedContent,
          category: formState.category,
          updateTime: Date.now(),
        }

        await onSave(editedPrompt)
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to save prompt:', error)
        toast.error('保存失败，请重试')
      } finally {
        setIsSubmitting(false)
        // 确保状态重置
        setFormState({
          title: '',
          content: '',
          category: '',
        })
      }
    },
    [formState, prompt, onSave, isSubmitting, onOpenChange]
  )

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" />
        <Dialog.Content
          className="fixed left-[50%] top-[50%] z-50 w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-lg focus:outline-none"
          onCloseAutoFocus={e => {
            e.preventDefault()
            // 确保对话框关闭后恢复页面交互
            document.body.style.pointerEvents = ''
          }}
        >
          <Dialog.Title className="text-xl font-semibold text-gray-900 mb-6">
            编辑提示词
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-gray-700"
              >
                标题
              </label>
              <input
                id="title"
                type="text"
                value={formState.title}
                onChange={e =>
                  setFormState(prev => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="content"
                className="text-sm font-medium text-gray-700"
              >
                内容
              </label>
              <textarea
                id="content"
                value={formState.content}
                onChange={e =>
                  setFormState(prev => ({ ...prev, content: e.target.value }))
                }
                className="w-full h-32 px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                分类
              </label>
              <select
                id="category"
                value={formState.category}
                onChange={e =>
                  setFormState(prev => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
                disabled={isSubmitting}
              >
                <option value="" disabled>
                  请选择分类
                </option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  取消
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? '保存中...' : '保存'}
              </button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="关闭"
              disabled={isSubmitting}
            >
              <CloseIcon className="w-5 h-5 text-gray-500" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
