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
  CloseIcon,
} from './icons'
import { getElectronAPI } from '@/lib/electron'
import { toast } from 'react-hot-toast'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface ProductPromptCardProps {
  prompt: ProductPrompt
  onEdit: (prompt: ProductPrompt) => void
  onMove: (prompt: ProductPrompt) => void
  onDelete: (id: string) => void
}

export function ProductPromptCard({
  prompt,
  onEdit,
  onMove,
  onDelete,
}: ProductPromptCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const electron = getElectronAPI()

  // 重置所有状态
  const resetState = () => {
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

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    onDelete(prompt.id)
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
    onEdit(prompt)
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

  // 修复 new Date() 类型错误
  const formatDate = (timestamp: number | undefined) => {
    // 确保 timestamp 是数字类型
    return timestamp ? new Date(timestamp).toLocaleDateString() : ''
  }

  return (
    <>
      <div
        className="group relative bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden h-[140px]"
        style={{
          boxShadow:
            '0 4px 12px -2px rgba(0, 0, 0, 0.02), 0 0 1px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800 line-clamp-1">
                {prompt.title}
              </h3>
              <div
                className={cn(
                  'flex items-center space-x-1 relative z-10',
                  prompt.isSystem
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100',
                  'transition-opacity duration-200'
                )}
              >
                <button
                  onClick={e => {
                    e.stopPropagation()
                    handleCopy()
                  }}
                  className="p-2 rounded-xl hover:bg-black/[0.03] transition-colors"
                  title="复制"
                >
                  <CopyIcon className="w-4 h-4 text-gray-600" />
                </button>
                {!prompt.isSystem && (
                  <DropdownMenu.Root
                    open={isDropdownOpen}
                    onOpenChange={setIsDropdownOpen}
                  >
                    <DropdownMenu.Trigger asChild>
                      <button
                        onClick={e => e.stopPropagation()}
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
                )}
              </div>
            </div>
            <div
              onClick={() => setShowDetailDialog(true)}
              className="cursor-pointer flex-1 overflow-hidden"
            >
              <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                {prompt.content}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 详情弹窗 */}
      <Dialog.Root open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200 flex flex-col">
            {/* 标题栏 */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  {prompt.title}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="p-1 hover:bg-gray-100 rounded-md transition-colors">
                    <CloseIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* 可滚动的内容区域 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    提示词内容
                  </h3>
                  <div className="p-4 bg-gray-50/70 rounded-lg">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                      {prompt.content}
                    </pre>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">
                    元数据信息
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">作者：</span>
                      <span className="text-sm text-gray-700">
                        {prompt.author}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">分类：</span>
                      <span className="text-sm text-gray-700">
                        {prompt.directory}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">创建时间：</span>
                      <span className="text-sm text-gray-700">
                        {formatDate(prompt.createTime)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">更新时间：</span>
                      <span className="text-sm text-gray-700">
                        {formatDate(prompt.updateTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 固定在底部的操作栏 */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <CopyIcon className="w-4 h-4" />
                  复制内容
                </button>
                {prompt.authorUrl && (
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <ShareIcon className="w-4 h-4" />
                    查看来源
                  </button>
                )}
              </div>
              <Dialog.Close asChild>
                <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  关闭
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
