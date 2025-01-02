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
  onSave?: (editedPrompt: ProductPrompt) => void
}

export function PromptEditDialog({
  prompt,
  open,
  onOpenChange,
  onSave,
}: PromptEditDialogProps) {
  const { categories } = usePromptStore()
  const [title, setTitle] = useState(prompt?.title ?? '')
  const [content, setContent] = useState(prompt?.content ?? '')
  const [category, setCategory] = useState(prompt?.category ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 当 prompt 改变时更新表单状态
  useEffect(() => {
    if (prompt && open) {
      console.log('PromptEditDialog: Updating form state with prompt:', prompt)
      setTitle(prompt.title)
      setContent(prompt.content)
      setCategory(prompt.category)
    }
  }, [prompt, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content || isSubmitting) return

    try {
      console.log('PromptEditDialog: Submitting form with values:', {
        title,
        content,
        category,
      })
      setIsSubmitting(true)

      const editedPrompt: ProductPrompt = {
        ...prompt!,
        title,
        content,
        category,
        updateTime: Date.now(),
      }

      // 调用父组件的保存回调，让父组件处理更新
      if (onSave) {
        await onSave(editedPrompt)
        console.log('PromptEditDialog: Parent save callback completed')
        // 保存成功后关闭对话框
        onOpenChange(false)
      }
    } catch (error) {
      console.error('PromptEditDialog: Error while saving:', error)
      toast.error('保存失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 处理对话框打开状态变化
  const handleOpenChange = useCallback(
    (open: boolean) => {
      // 如果正在提交，不允许关闭对话框
      if (isSubmitting) return

      if (!open) {
        // 关闭对话框时重置状态
        setIsSubmitting(false)
        if (prompt) {
          setTitle(prompt.title)
          setContent(prompt.content)
          setCategory(prompt.category)
        }
      }

      onOpenChange(open)
    },
    [isSubmitting, prompt, onOpenChange]
  )

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200"
          aria-describedby="edit-dialog-description"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                编辑提示词
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                  disabled={isSubmitting}
                >
                  <CloseIcon className="w-5 h-5 text-gray-500" />
                </button>
              </Dialog.Close>
            </div>

            <Dialog.Description
              id="edit-dialog-description"
              className="sr-only"
            >
              编辑提示词的标题、内容和分类
            </Dialog.Description>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  内容
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  分类
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
