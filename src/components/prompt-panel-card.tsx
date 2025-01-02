import React from 'react'
import type { ProductPrompt } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

interface PromptPanelCardProps {
  prompt: ProductPrompt
}

export const PromptPanelCard: React.FC<PromptPanelCardProps> = ({ prompt }) => {
  const handleCopy = async () => {
    const electron = window.electron
    if (!electron?.clipboard) return

    try {
      await electron.clipboard.writeText(prompt.content)
      toast.success('已复制到剪贴板', { duration: 1000 })
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('复制失败')
    }
  }

  return (
    <div
      className={cn(
        'p-3 rounded-lg cursor-pointer',
        'border border-border/50',
        'hover:bg-accent/50 transition-colors',
        'group'
      )}
      onClick={handleCopy}
    >
      <h3 className="text-sm font-medium mb-1 group-hover:text-primary">
        {prompt.title}
      </h3>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {prompt.content}
      </p>
    </div>
  )
}
