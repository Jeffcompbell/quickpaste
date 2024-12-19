// 产品提示词卡片
import { useState } from 'react'
import { ProductPrompt } from '@/types'
import { cn } from '@/lib/utils'
import { CopyIcon, ShareIcon } from './icons'
import { getElectronAPI } from '@/lib/electron'
import { toast } from 'react-hot-toast'

export function ProductPromptCard({ prompt }: { prompt: ProductPrompt }) {
  const [showActions, setShowActions] = useState(false)
  const [imageError, setImageError] = useState(false)
  const electron = getElectronAPI()

  const handleCopy = () => {
    electron.clipboard.writeText(prompt.content)
    toast.success('已复制到剪贴板')
  }

  const handleShare = () => {
    if (prompt.authorUrl) {
      window.open(prompt.authorUrl, '_blank')
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div
      className="group relative p-6 rounded-2xl transition-all duration-200 h-full flex flex-col"
      style={{
        background:
          'linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
        backdropFilter: 'blur(8px)',
        boxShadow: showActions
          ? '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02)'
          : '0 4px 16px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
        transform: showActions ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800 line-clamp-1">
            {prompt.title}
          </h3>
          <div
            className={cn(
              'flex items-center space-x-1 opacity-0 transition-opacity duration-200',
              showActions && 'opacity-100'
            )}
          >
            <button
              onClick={handleShare}
              className="p-2 rounded-xl hover:bg-black/[0.03] transition-colors"
              title="分享"
            >
              <ShareIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl hover:bg-black/[0.03] transition-colors"
              title="复制"
            >
              <CopyIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
          {prompt.content}
        </p>
      </div>
      <div
        className="pt-4 mt-4"
        style={{ borderTop: '1px solid rgba(0, 0, 0, 0.04)' }}
      >
        <button
          onClick={handleShare}
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          {prompt.authorAvatar && !imageError ? (
            <img
              src={prompt.authorAvatar}
              alt={prompt.author}
              className="w-6 h-6 rounded-full ring-1 ring-black/[0.03]"
              onError={handleImageError}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
              {prompt.author?.charAt(0)}
            </div>
          )}
          <span className="text-sm text-gray-500 line-clamp-1">
            {prompt.author}
          </span>
        </button>
      </div>
    </div>
  )
}
