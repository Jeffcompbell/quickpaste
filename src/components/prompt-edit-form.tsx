import { useState } from 'react'
import { ProductPrompt } from '@/types'
import { usePromptStore } from '@/store/prompt'
import { toast } from 'react-hot-toast'

interface PromptEditFormProps {
  prompt: ProductPrompt
  onClose: () => void
}

export function PromptEditForm({ prompt, onClose }: PromptEditFormProps) {
  const { updatePrompt } = usePromptStore()
  const [title, setTitle] = useState(prompt.title)
  const [content, setContent] = useState(prompt.content)
  const [author, setAuthor] = useState(prompt.author)
  const [authorUrl, setAuthorUrl] = useState(prompt.authorUrl || '')
  const [authorAvatar, setAuthorAvatar] = useState(prompt.authorAvatar || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePrompt({
      ...prompt,
      title,
      content,
      author,
      authorUrl,
      authorAvatar,
    })
    onClose()
    toast.success('保存成功', {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          标题
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          内容
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          作者
        </label>
        <input
          type="text"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          作者链接
        </label>
        <input
          type="url"
          value={authorUrl}
          onChange={e => setAuthorUrl(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          作者头像
        </label>
        <input
          type="url"
          value={authorAvatar}
          onChange={e => setAuthorAvatar(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900"
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          保存
        </button>
      </div>
    </form>
  )
}
