import { memo, useCallback } from 'react'
import { PromptCard } from './prompt-card'
import { usePromptStore } from '@/store/prompt'
import type { ProductPrompt } from '@/types'
import { toast } from 'react-hot-toast'

interface PromptListProps {
  prompts: ProductPrompt[]
}

// 记忆化整个列表组件
export const PromptList = memo(function PromptList({
  prompts,
}: PromptListProps) {
  const updatePrompt = usePromptStore(state => state.updatePrompt)
  const deletePrompt = usePromptStore(state => state.deletePrompt)
  const categories = usePromptStore(state => state.categories)

  // 添加日志以跟踪渲染
  console.log('PromptList: Rendering with prompts:', prompts.length)

  // 记忆化回调函数
  const handleEdit = useCallback(
    async (prompt: ProductPrompt) => {
      try {
        await updatePrompt(prompt)
      } catch (error) {
        console.error('Failed to update prompt:', error)
        toast.error('保存失败')
      }
    },
    [updatePrompt]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deletePrompt(id)
        toast.success('删除成功')
      } catch (error) {
        console.error('Failed to delete prompt:', error)
        toast.error('删除失败')
      }
    },
    [deletePrompt]
  )

  const handleCopy = useCallback(async (content: string) => {
    if (!window.electron?.clipboard) return
    try {
      await window.electron.clipboard.writeText(content)
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('复制失败')
    }
  }, [])

  const handleMove = useCallback(
    async (promptId: string, categoryId: string) => {
      const prompt = prompts.find(p => p.id === promptId)
      if (prompt) {
        try {
          await updatePrompt({ ...prompt, category: categoryId })
          toast.success('移动成功')
        } catch (error) {
          console.error('Failed to move prompt:', error)
          toast.error('移动失败')
        }
      }
    },
    [prompts, updatePrompt]
  )

  if (prompts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        暂无提示词
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {prompts.map(prompt => {
        console.log('PromptList: Rendering prompt:', prompt.id, prompt.title)
        return (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onCopy={handleCopy}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMove={handleMove}
            categoryName={
              categories.find(c => c.id === prompt.category)?.name ?? '未分类'
            }
          />
        )
      })}
    </div>
  )
})
