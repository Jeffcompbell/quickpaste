import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { usePromptStore } from '@/store/prompt'

export function PromptDialog() {
  const [open, setOpen] = useState(false)
  const { categories, addPrompt, activeCategory } = usePromptStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState(activeCategory)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addPrompt({
      title,
      content,
      category,
    })
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setCategory(activeCategory)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          新建
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-background rounded-lg p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold">
            新建提示词
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">标题</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">内容</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent min-h-[100px]"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">分类</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-input bg-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm border border-input rounded-md hover:bg-accent"
                >
                  取消
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
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
