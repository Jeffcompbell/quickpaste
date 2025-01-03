import { memo, useCallback, useState } from 'react'
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
        'flex items-center space-x-1 absolute top-3 right-3',
        !isSystem && 'opacity-0 group-hover:opacity-100',
        'transition-opacity duration-200'
      )}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onMouseDown={e => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {onShare && !isSystem && (
        <button
          onClick={e => {
            e.preventDefault()
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
          e.preventDefault()
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
          onOpenChange={open => {
            setIsDropdownOpen(open)
          }}
        >
          <DropdownMenu.Trigger asChild>
            <button
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="p-2 rounded-xl hover:bg-black/[0.03] transition-colors"
            >
              <MoreHorizontalIcon className="w-4 h-4 text-gray-600" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
              sideOffset={5}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              {onEdit && (
                <DropdownMenu.Item
                  onClick={e => {
                    e.preventDefault()
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
                      className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
                      sideOffset={2}
                      alignOffset={-5}
                    >
                      {customCategories.map(category => (
                        <DropdownMenu.Item
                          key={category.id}
                          onClick={e => {
                            e.preventDefault()
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
                    e.preventDefault()
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
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {prompt.title}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500 mt-2">
                查看提示词的详细内容。
              </Dialog.Description>

              {/* 分类和时间信息 */}
              <div className="flex items-center text-sm text-gray-500 mt-4">
                <span>{categoryName}</span>
                <span className="mx-2">·</span>
                <span>{formatDate(prompt.createTime)}</span>
                {prompt.author && (
                  <>
                    <span className="mx-2">·</span>
                    <span>{prompt.author}</span>
                  </>
                )}
              </div>

              {/* 内容 */}
              <div
                className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed mt-4"
                aria-describedby="prompt-content-description"
              >
                <div id="prompt-content-description" className="sr-only">
                  提示词的详细内容如下：
                </div>
                {prompt.content}
              </div>
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
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const isSystem = prompt.isSystem || prompt.category === 'system'

  const handleCopy = useCallback(() => {
    onCopy(prompt.content)
  }, [onCopy, prompt.content])

  const handleSave = useCallback(
    async (editedPrompt: ProductPrompt) => {
      if (onEdit && !isSystem) {
        try {
          await onEdit(editedPrompt)
          setIsEditOpen(false)
        } catch (error) {
          console.error('Failed to save prompt:', error)
          // 保存失败时不关闭对话框，让用户可以看到错误提示
        }
      }
    },
    [onEdit, isSystem]
  )

  return (
    <>
      <div
        className={cn(
          'group relative bg-white/80 hover:bg-white rounded-lg p-4',
          'border border-gray-100/80 hover:border-gray-200/80',
          'shadow-sm hover:shadow transition-all duration-200',
          'cursor-pointer select-none h-32',
          isSystem && 'bg-gray-50/80 hover:bg-gray-50',
          className
        )}
        onClick={() => setIsDetailOpen(true)}
      >
        <div className="flex items-start gap-3">
          <CardContent title={prompt.title} content={prompt.content} />
          <ActionButtons
            onCopy={handleCopy}
            isSystem={isSystem}
            onEdit={!isSystem ? () => setIsEditOpen(true) : undefined}
            onDelete={!isSystem ? () => onDelete?.(prompt.id) : undefined}
            onMove={
              !isSystem
                ? categoryId => onMove?.(prompt.id, categoryId)
                : undefined
            }
          />
        </div>
      </div>

      <DetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        prompt={prompt}
        categoryName={categoryName}
        onCopy={onCopy}
      />

      {!isSystem && onEdit && (
        <PromptEditDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          prompt={prompt}
          onSave={handleSave}
        />
      )}
    </>
  )
})
