import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { usePromptStore } from '@/store/prompt'
import { PlusIcon } from './icons'

export function PromptDialog() {
  const { categories, addPrompt } = usePromptStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')

  // 过滤出自定义分类
  const customCategories = categories.filter(cat => !cat.isSystem)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content || !category) return

    addPrompt({
      title,
      content,
      category,
      type: 'product',
      author: 'User',
    })

    setOpen(false)
    setTitle('')
    setContent('')
    setCategory('')
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-4 h-9 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          <span>新建提示词</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              新建提示词
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-500 mt-2">
              创建一个新的提示词，填写标题、内容和选择分类。
            </Dialog.Description>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto"
            aria-label="新建提示词表单"
            aria-describedby="new-prompt-description"
          >
            <div id="new-prompt-description" className="sr-only">
              新建提示词的表单，包含标题、内容和分类字段。
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  标题
                </label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  内容
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  分类
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors"
                  required
                >
                  <option value="" disabled>
                    请选择分类
                  </option>
                  {customCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                确定
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
