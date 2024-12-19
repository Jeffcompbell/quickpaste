// 产品提示词卡片
import { useState } from 'react'
import { ProductPrompt } from '@/types'
import { cn } from '@/lib/utils'
import {
  CopyIcon,
  ShareIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ArrowRightIcon,
  TrashIcon,
} from './icons'
import { getElectronAPI } from '@/lib/electron'
import { toast } from 'react-hot-toast'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface ProductPromptCardProps {
  prompt: ProductPrompt
  onEdit?: (prompt: ProductPrompt) => void
  onMove?: (prompt: ProductPrompt) => void
  onDelete?: (prompt: ProductPrompt) => void
}

export function ProductPromptCard({
  prompt,
  onEdit,
  onMove,
  onDelete,
}: ProductPromptCardProps) {
  const [showActions, setShowActions] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const electron = getElectronAPI()

  // 重置所有状态
  const resetState = () => {
    setShowActions(false)
    setIsDropdownOpen(false)
  }

  const handleCopy = async () => {
    try {
      await electron.clipboard.writeText(prompt.content)
      toast.success('已复制到剪贴板', {
        duration: 1500,
        position: 'top-center',
        style: {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      })
    } catch (error) {
      toast.error('复制失败，请重试', {
        duration: 1500,
        position: 'top-center',
      })
    }
  }

  const handleShare = () => {
    if (prompt.authorUrl) {
      window.open(prompt.authorUrl, '_blank')
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    onDelete?.(prompt)
    setShowDeleteDialog(false)
    resetState()
    toast.success('已删除提示词', {
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

  const handleEdit = () => {
    onEdit?.(prompt)
    setIsDropdownOpen(false)
    resetState()
    toast.success('已进入编辑模式', {
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

  const handleMove = () => {
    onMove?.(prompt)
    setIsDropdownOpen(false)
    resetState()
    toast.success('请选择目标目录', {
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
    <>
      <div
        className="group relative p-4 rounded-2xl transition-all duration-200 h-full flex flex-col"
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
        onMouseLeave={() => !isDropdownOpen && setShowActions(false)}
      >
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-800 line-clamp-1">
              {prompt.title}
            </h3>
            <div
              className={cn(
                'flex items-center space-x-1 opacity-0 transition-opacity duration-200',
                (showActions || isDropdownOpen) && 'opacity-100'
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
              <DropdownMenu.Root
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
              >
                <DropdownMenu.Trigger asChild>
                  <button
                    className="p-2 rounded-xl hover:bg-black/[0.03] transition-colors"
                    title="更多"
                  >
                    <MoreHorizontalIcon className="w-4 h-4 text-gray-600" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[160px] bg-white rounded-lg p-1 shadow-lg border border-gray-100"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                      onClick={handleEdit}
                    >
                      <PencilIcon className="w-4 h-4 mr-2 text-gray-500" />
                      编辑
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer"
                      onClick={handleMove}
                    >
                      <ArrowRightIcon className="w-4 h-4 mr-2 text-gray-500" />
                      移动到
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                      onClick={handleDelete}
                    >
                      <TrashIcon className="w-4 h-4 mr-2 text-red-500" />
                      删除
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
          <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
            {prompt.content}
          </p>
        </div>
        <div
          className="pt-3 mt-3 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(0, 0, 0, 0.04)' }}
        >
          <span className="text-sm text-gray-500 line-clamp-1">
            {prompt.author}
          </span>
          <button
            onClick={handleShare}
            className="flex items-center hover:opacity-80 transition-opacity"
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
          </button>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
          <Dialog.Content
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200"
            aria-describedby="delete-dialog-description"
          >
            <div className="p-6">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                确认删除
              </Dialog.Title>
              <Dialog.Description
                id="delete-dialog-description"
                className="mt-2 text-sm text-gray-500"
              >
                确定要删除这个提示词吗？此操作无法撤销。
              </Dialog.Description>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100 rounded-b-lg">
              <Dialog.Close asChild>
                <button className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  取消
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
