import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { FolderIcon, PlusIcon, PencilIcon, TrashIcon } from './icons'
import { productDirectories } from '@/config/directories'
import { usePromptStore } from '@/store/prompt'
import { useDirectoryStore } from '@/store/directory'
import * as Dialog from '@radix-ui/react-dialog'
import { toast } from 'react-hot-toast'

interface CategorySidebarProps {
  activeCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export function CategorySidebar({
  activeCategory,
  onCategoryChange,
}: CategorySidebarProps) {
  const { prompts } = usePromptStore()
  const { directories, addDirectory, updateDirectory, deleteDirectory } =
    useDirectoryStore()
  const [editingDirectory, setEditingDirectory] = useState<{
    id: string
    name: string
  } | null>(null)
  const [directoryCounts, setDirectoryCounts] = useState<
    Record<string, number>
  >({})
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newDirectoryName, setNewDirectoryName] = useState('')

  // 计算每个目录下的提示词数量
  useEffect(() => {
    const counts: Record<string, number> = {}
    prompts.forEach(prompt => {
      const directory = prompt.directory || 'default'
      counts[directory] = (counts[directory] || 0) + 1
    })
    setDirectoryCounts(counts)
  }, [prompts])

  // 检查目录是否有内容
  const hasContent = (directoryId: string) => {
    return prompts.some(prompt => prompt.directory === directoryId)
  }

  const handleAddDirectory = () => {
    if (!newDirectoryName.trim()) {
      toast.error('目录名称不能为空')
      return
    }

    addDirectory({
      id: `custom-${Date.now()}`,
      name: newDirectoryName.trim(),
      type: 'product',
    })

    setNewDirectoryName('')
    setShowAddDialog(false)
    toast.success('目录创建成功')
  }

  const handleUpdateDirectory = (id: string, newName: string) => {
    if (!newName.trim()) {
      toast.error('目录名称不能为空')
      return
    }

    updateDirectory(id, { name: newName.trim() })
    setEditingDirectory(null)
    toast.success('目录更新成功')
  }

  const handleDeleteDirectory = (id: string) => {
    if (hasContent(id)) {
      toast.error('目录不为空，无法删除')
      return
    }

    deleteDirectory(id)
    if (activeCategory === id) {
      onCategoryChange(null)
    }
    toast.success('目录删除成功')
  }

  return (
    <div className="w-72 flex-shrink-0 p-4">
      <div
        className="h-full rounded-xl p-2 overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.7))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          WebkitAppRegion: 'no-drag',
        }}
      >
        <div className="flex items-center justify-between px-2 mb-2">
          <h2 className="text-sm font-medium text-gray-700">目录</h2>
          <button
            onClick={() => setShowAddDialog(true)}
            className="p-1 hover:bg-black/[0.03] rounded-md transition-colors"
            title="新建目录"
          >
            <PlusIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <nav className="space-y-1" style={{ WebkitAppRegion: 'no-drag' }}>
          {/* 全部分类 */}
          <div
            className={cn(
              'group flex items-center px-3 py-2 text-sm rounded-lg transition-all',
              'hover:bg-black/[0.03]',
              activeCategory === null
                ? 'bg-black/[0.05] text-gray-900 font-medium'
                : 'text-gray-600'
            )}
          >
            <button
              onClick={() => onCategoryChange(null)}
              className="flex items-center flex-1 min-w-0 mr-3"
            >
              <FolderIcon className="w-4 h-4 mr-2 flex-shrink-0 opacity-60" />
              <span className="truncate">全部</span>
            </button>
            <div className="flex items-center gap-1 flex-shrink-0 w-[68px] justify-end">
              <span className="text-xs text-gray-400 tabular-nums">
                {prompts.length}
              </span>
            </div>
          </div>

          {/* 系统分类 */}
          <div className="py-2">
            <div className="px-3 mb-2">
              <span className="text-xs font-medium text-gray-400">
                系统分类
              </span>
            </div>
            {productDirectories.map(directory => (
              <div
                key={directory.id}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm rounded-lg transition-all',
                  'hover:bg-black/[0.03]',
                  activeCategory === directory.id
                    ? 'bg-black/[0.05] text-gray-900 font-medium'
                    : 'text-gray-600'
                )}
              >
                <button
                  onClick={() => onCategoryChange(directory.id)}
                  className="flex items-center flex-1 min-w-0 mr-3"
                >
                  <FolderIcon className="w-4 h-4 mr-2 flex-shrink-0 opacity-60" />
                  <span className="truncate">{directory.name}</span>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0 w-[68px] justify-end">
                  <span className="text-xs text-gray-400 tabular-nums">
                    {directoryCounts[directory.id] || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 自定义分类 */}
          {directories.length > 0 && (
            <div className="py-2">
              <div className="px-3 mb-2">
                <span className="text-xs font-medium text-gray-400">
                  自定义分类
                </span>
              </div>
              {directories.map(directory => (
                <div
                  key={directory.id}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm rounded-lg transition-all',
                    'hover:bg-black/[0.03]',
                    activeCategory === directory.id
                      ? 'bg-black/[0.05] text-gray-900 font-medium'
                      : 'text-gray-600'
                  )}
                >
                  <button
                    onClick={() => onCategoryChange(directory.id)}
                    className="flex items-center flex-1 min-w-0 mr-3"
                  >
                    <FolderIcon className="w-4 h-4 mr-2 flex-shrink-0 opacity-60" />
                    <span className="truncate">{directory.name}</span>
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0 w-[68px] justify-end">
                    <span className="text-xs text-gray-400 tabular-nums">
                      {directoryCounts[directory.id] || 0}
                    </span>
                    <button
                      onClick={() => setEditingDirectory(directory)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-black/[0.03] rounded-md transition-all"
                      title="编辑目录"
                    >
                      <PencilIcon className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDeleteDirectory(directory.id)}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-black/[0.03] rounded-md transition-all"
                      title="删除目录"
                      disabled={hasContent(directory.id)}
                    >
                      <TrashIcon className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>
      </div>

      {/* 新建目录对话框 */}
      <Dialog.Root open={showAddDialog} onOpenChange={setShowAddDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200">
            <div className="p-6">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                新建目录
              </Dialog.Title>
              <div className="mt-4">
                <input
                  type="text"
                  value={newDirectoryName}
                  onChange={e => setNewDirectoryName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors"
                  placeholder="请输入目录名称"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
              <Dialog.Close asChild>
                <button className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  取消
                </button>
              </Dialog.Close>
              <button
                onClick={handleAddDirectory}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                确定
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 编辑目录对话框 */}
      <Dialog.Root
        open={!!editingDirectory}
        onOpenChange={() => setEditingDirectory(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200">
            <div className="p-6">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                编辑目录
              </Dialog.Title>
              <div className="mt-4">
                <input
                  type="text"
                  value={editingDirectory?.name || ''}
                  onChange={e =>
                    setEditingDirectory(prev =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors"
                  placeholder="请输入目录名称"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
              <Dialog.Close asChild>
                <button className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                  取消
                </button>
              </Dialog.Close>
              <button
                onClick={() =>
                  editingDirectory &&
                  handleUpdateDirectory(
                    editingDirectory.id,
                    editingDirectory.name
                  )
                }
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                确定
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
