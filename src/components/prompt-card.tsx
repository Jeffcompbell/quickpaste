import { useState } from 'react'
import { ProductPrompt } from '@/types'
import { cn } from '@/lib/utils'
import { CopyIcon, ShareIcon } from './icons'
import { getElectronAPI } from '@/lib/electron'

interface PromptCardProps {
  prompt: ProductPrompt
  className?: string
}

// 产品需求提示词卡片
export function PromptCard({ prompt, className }: PromptCardProps) {
  const [showActions, setShowActions] = useState(false)
  const electron = getElectronAPI()

  const handleCopy = () => {
    electron.clipboard.writeText(prompt.content)
  }

  const handleShare = () => {
    if (prompt.authorUrl) {
      window.open(prompt.authorUrl, '_blank')
    }
  }

  return (
    <div
      className={cn(
        'group p-4 rounded-lg',
        'bg-white',
        'border border-neutral-200',
        'hover:border-neutral-300',
        'hover:bg-neutral-50',
        'shadow-sm',
        'transition-all duration-150',
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            {prompt.title}
          </h3>
          <div
            className={cn(
              'flex items-center space-x-2 opacity-0 transition-opacity duration-150',
              showActions && 'opacity-100'
            )}
          >
            <button
              onClick={handleShare}
              className="p-1.5 rounded-md hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
              title="分享"
            >
              <ShareIcon className="w-4 h-4 text-neutral-500" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
              title="复制"
            >
              <CopyIcon className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
        </div>
        <p className="text-sm text-neutral-500 whitespace-pre-wrap">
          {prompt.content}
        </p>
        <div className="flex items-center space-x-2 mt-4">
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 hover:bg-neutral-100 active:bg-neutral-200 rounded-md px-2 py-1 transition-colors"
          >
            <img
              src={prompt.authorAvatar}
              alt={prompt.author}
              className="w-6 h-6 rounded-full border border-neutral-200"
            />
            <span className="text-sm text-neutral-600">{prompt.author}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
