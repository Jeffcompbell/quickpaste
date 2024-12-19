import { useState } from 'react'
import { CursorPrompt, ProductPrompt, Prompt } from '@/types'
import { cn } from '@/lib/utils'
import { CopyIcon, ShareIcon, EditIcon, TrashIcon } from './icons'
import { getElectronAPI } from '@/lib/electron'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface PromptCardProps {
  prompt: Prompt
  className?: string
  onEdit?: (prompt: CursorPrompt) => void
  onDelete?: (id: string) => void
}

function MoreHorizontalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
}

// Cursor 对话提示词卡片
function CursorPromptCard({
  prompt,
  onEdit,
  onDelete,
}: PromptCardProps & { prompt: CursorPrompt }) {
  const electron = getElectronAPI()

  const handleCopy = () => {
    electron.clipboard.writeText(prompt.content)
  }

  return (
    <div
      className="group p-4 rounded-lg 
                 bg-white
                 border border-neutral-200
                 hover:border-neutral-300
                 hover:bg-neutral-50
                 shadow-sm
                 transition-all duration-150"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-900">{prompt.title}</h3>
        <DropdownMenu.Trigger asChild>
          <button
            className="p-1.5 rounded-md 
                      opacity-0 group-hover:opacity-100 
                      hover:bg-neutral-100
                      active:bg-neutral-200 
                      transition-all duration-150"
          >
            <MoreHorizontalIcon className="w-4 h-4 text-neutral-500" />
          </button>
        </DropdownMenu.Trigger>
      </div>
      <p className="mt-2 text-sm text-neutral-500 line-clamp-2">
        {prompt.content}
      </p>
      <DropdownMenu.Content
        className="min-w-[160px] 
                  bg-white 
                  border border-neutral-200
                  rounded-lg p-1.5 
                  shadow-sm"
      >
        <DropdownMenu.Item
          className="flex items-center px-3 py-2 
                    text-sm rounded-md
                    text-neutral-700
                    hover:bg-neutral-100
                    active:bg-neutral-200
                    transition-colors
                    cursor-pointer"
          onClick={() => handleCopy()}
        >
          <CopyIcon className="w-4 h-4 mr-2.5 text-neutral-500" />
          复制
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="flex items-center px-3 py-2 
                    text-sm rounded-md
                    text-neutral-700
                    hover:bg-neutral-100
                    active:bg-neutral-200
                    transition-colors
                    cursor-pointer"
          onClick={() => onEdit?.(prompt)}
        >
          <EditIcon className="w-4 h-4 mr-2.5 text-neutral-500" />
          编辑
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="flex items-center px-3 py-2 
                    text-sm rounded-md
                    text-red-600
                    hover:bg-red-50
                    active:bg-red-100
                    transition-colors
                    cursor-pointer"
          onClick={() => onDelete?.(prompt.id)}
        >
          <TrashIcon className="w-4 h-4 mr-2.5 text-red-500" />
          删除
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </div>
  )
}

// 产品需求提示词卡片
function ProductPromptCard({
  prompt,
}: PromptCardProps & { prompt: ProductPrompt }) {
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
      className="group p-4 rounded-lg 
                 bg-white
                 border border-neutral-200
                 hover:border-neutral-300
                 hover:bg-neutral-50
                 shadow-sm
                 transition-all duration-150"
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
              className="p-1.5 rounded-md 
                       hover:bg-neutral-100
                       active:bg-neutral-200 
                       transition-colors"
              title="分享"
            >
              <ShareIcon className="w-4 h-4 text-neutral-500" />
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md 
                       hover:bg-neutral-100
                       active:bg-neutral-200 
                       transition-colors"
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
            className="flex items-center space-x-2 
                     hover:bg-neutral-100
                     active:bg-neutral-200
                     rounded-md px-2 py-1
                     transition-colors"
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

// 主卡片组件
export function PromptCard(props: PromptCardProps) {
  if (props.prompt.type === 'cursor') {
    return <CursorPromptCard {...props} prompt={props.prompt} />
  } else {
    return <ProductPromptCard {...props} prompt={props.prompt} />
  }
}
