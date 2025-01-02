import React, { memo, useCallback, useState } from 'react'
import { ProductPrompt } from '../types'
import { cn } from '../lib/utils'
import {
  CopyIcon,
  ShareIcon,
  MoreHorizontalIcon,
  PencilIcon,
  ArrowRightIcon,
  TrashIcon,
  CloseIcon,
} from './icons'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { usePromptStore } from '../store/prompt'
import { PromptEditDialog } from './prompt-edit-dialog'
import { getElectronAPI } from '../lib/electron'
import { toast } from 'react-hot-toast'

interface PromptCardProps {
  prompt: ProductPrompt
  onCopy: (content: string) => void
  onEdit?: (prompt: ProductPrompt) => void
  onDelete?: (id: string) => void
  onMove?: (promptId: string, categoryId: string) => void
  categoryName?: string
  className?: string
}

// 分离卡片内容组件
const CardContent = memo(function CardContent({
  title,
  content,
}: {
  title: string
  content: string
}) {
  return (
    <div className="flex-1 space-y-3">
      <h3 className="text-base font-medium text-gray-800 line-clamp-1">
        {title}
      </h3>
      <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
        {content}
      </p>
    </div>
  )
})

// 格式化日期函数
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString()
}

// 分离操作按钮组件
const ActionButtons = memo(function ActionButtons({
  onCopy,
  onShare,
  isSystem,
  onEdit,
  onDelete,
  onMove,
}: {
  onCopy: () => void
  onShare?: () => void
  isSystem: boolean
  onEdit?: () => void
  onDelete?: () => void
  onMove?: (categoryId: string) => void
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { categories } = usePromptStore()
  const customCategories = categories.filter(cat => !cat.isSystem)

  return (
    <div
      className={cn(
        'flex items-center space-x-1 relative z-10',
        !isSystem && 'opacity-0 group-hover:opacity-100',
        'transition-opacity duration-200'
      )}
    >
      {onShare && (
        <button
          onClick={e => {
            e.stopPropagation()
            onShare()
          }}
          className="p-2 rounded-xl hover:bg-black/[0.03] transition-colors"
          title="分享"
        >
          <ShareIcon className="w-4 h-4 text-gray-600" />
        </button>
      )}
      <button
        onClick={e => {
          e.stopPropagation()
          onCopy()
        }}
        className="p-2 rounded-xl hover:bg-black/[0.03] transition-colors"
        title="复制"
      >
        <CopyIcon className="w-4 h-4 text-gray-600" />
      </button>
      {!isSystem && (onEdit || onDelete || onMove) && (
        <DropdownMenu.Root
          open={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
        >
          <DropdownMenu.Trigger asChild>
            <button
              onClick={e => e.stopPropagation()}
              className="p-2 rounded-xl hover:bg-black/[0.03] transition-colors"
            >
              <MoreHorizontalIcon className="w-4 h-4 text-gray-600" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-100 py-1"
              sideOffset={5}
            >
              {onEdit && (
                <DropdownMenu.Item
                  onClick={e => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <PencilIcon className="w-4 h-4 mr-2" />
                  编辑
                </DropdownMenu.Item>
              )}
              {onMove && (
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    <ArrowRightIcon className="w-4 h-4 mr-2" />
                    移动到
                  </DropdownMenu.SubTrigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent
                      className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-100 py-1"
                      sideOffset={2}
                      alignOffset={-5}
                    >
                      {customCategories.map(category => (
                        <DropdownMenu.Item
                          key={category.id}
                          onClick={e => {
                            e.stopPropagation()
                            onMove(category.id)
                          }}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          {category.name}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
              )}
              {onDelete && (
                <DropdownMenu.Item
                  onClick={e => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  删除
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  )
})

// 添加详情对话框组件
const DetailDialog = memo(function DetailDialog({
  open,
  onOpenChange,
  prompt,
  categoryName,
  onCopy,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: ProductPrompt
  categoryName: string
  onCopy: (content: string) => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-[600px] max-h-[85vh] bg-white rounded-xl shadow-2xl p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* 标题和分类 */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {prompt.title}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{categoryName}</span>
                <span>·</span>
                <span>{formatDate(prompt.createTime)}</span>
                {prompt.author && (
                  <>
                    <span>·</span>
                    <span>{prompt.author}</span>
                  </>
                )}
              </div>
            </div>

            {/* 内容 */}
            <div className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
              {prompt.content}
            </div>

            {/* 底部操作栏 */}
            <div className="flex justify-end items-center space-x-2 pt-4">
              <button
                onClick={() => onCopy(prompt.content)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CopyIcon className="w-4 h-4 mr-2" />
                复制内容
              </button>
              <Dialog.Close asChild>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <CloseIcon className="w-4 h-4 mr-2" />
                  关闭
                </button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
})

export const PromptCard = memo(function PromptCard({
  prompt,
  onCopy,
  onEdit,
  onDelete,
  onMove,
  categoryName = '未分类',
  className,
}: PromptCardProps) {
  const [dialogState, setDialogState] = useState({
    showEditDialog: false,
    showDetailDialog: false,
  })

  const handleCopyClick = useCallback(() => {
    onCopy(prompt.content)
  }, [onCopy, prompt.content])

  const handleShare = useCallback(() => {
    if (prompt.authorUrl) {
      window.open(prompt.authorUrl, '_blank')
    }
  }, [prompt.authorUrl])

  const handleEdit = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setDialogState(prev => ({ ...prev, showEditDialog: true }))
  }, [])

  const handleDelete = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      if (onDelete) {
        onDelete(prompt.id)
      }
    },
    [onDelete, prompt.id]
  )

  const handleMove = useCallback(
    (categoryId: string) => {
      if (onMove) {
        onMove(prompt.id, categoryId)
      }
    },
    [onMove, prompt.id]
  )

  const handleEditSave = useCallback(
    async (editedPrompt: ProductPrompt) => {
      try {
        if (onEdit) {
          await onEdit(editedPrompt)
        }
      } catch (error) {
        console.error('Failed to save:', error)
        throw error
      }
    },
    [onEdit]
  )

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.action-buttons')) {
      return
    }
    setDialogState(prev => ({ ...prev, showDetailDialog: true }))
  }, [])

  // 处理提示词复制
  const handleCopy = async (content: string) => {
    const electron = getElectronAPI()
    if (!electron?.ipcRenderer) {
      // 如果 Electron API 不可用，回退到 Web API
      try {
        await navigator.clipboard.writeText(content)
        toast.success('已复制到剪贴板')
      } catch (error) {
        console.error('Failed to copy:', error)
        toast.error('复制失败')
      }
      return
    }

    try {
      await electron.ipcRenderer.send('clipboard:write-text', content)
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('复制失败')
    }
  }

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          'group relative flex items-start p-4 bg-white hover:bg-gray-50 rounded-xl border border-gray-100/80',
          'transition-colors duration-200 cursor-pointer',
          className
        )}
      >
        <CardContent title={prompt.title} content={prompt.content} />
        <div className="action-buttons">
          <ActionButtons
            onCopy={handleCopyClick}
            onShare={prompt.authorUrl ? handleShare : undefined}
            isSystem={!!prompt.isSystem}
            onEdit={!prompt.isSystem && onEdit ? handleEdit : undefined}
            onDelete={!prompt.isSystem && onDelete ? handleDelete : undefined}
            onMove={!prompt.isSystem && onMove ? handleMove : undefined}
          />
        </div>
      </div>

      {/* 编辑对话框 */}
      {onEdit && (
        <PromptEditDialog
          open={dialogState.showEditDialog}
          onOpenChange={open =>
            setDialogState(prev => ({ ...prev, showEditDialog: open }))
          }
          prompt={prompt}
          onSave={handleEditSave}
        />
      )}

      {/* 详情对话框 */}
      <DetailDialog
        open={dialogState.showDetailDialog}
        onOpenChange={open =>
          setDialogState(prev => ({ ...prev, showDetailDialog: open }))
        }
        prompt={prompt}
        categoryName={categoryName}
        onCopy={handleCopy}
      />
    </>
  )
})
