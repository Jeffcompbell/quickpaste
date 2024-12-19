import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { FolderIcon, PlusIcon, PencilIcon, TrashIcon } from './icons'
import { useDirectoryStore } from '@/store/directory'
import { usePromptStore } from '@/store/prompt'
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
  const { directories, addDirectory, updateDirectory, deleteDirectory } =
    useDirectoryStore()
  const { prompts } = usePromptStore()
  const [editingDirectory, setEditingDirectory] = useState<{
    id: string
    name: string
  } | null>(null)
  const [directoryCounts, setDirectoryCounts] = useState<
    Record<string, number>
  >({})

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

  const handleAddDirectory = (name: string) => {
    if (!name.trim()) {
      toast.error('目录名称不能为空')
      return
    }
    addDirectory(name.trim())
    toast.success('目录创建成功')
  }

  const handleUpdateDirectory = (id: string, name: string) => {
    if (!name.trim()) {
      toast.error('目录名称不能为空')
      return
    }
    updateDirectory(id, name.trim())
    setEditingDirectory(null)
    toast.success('目录更新成功')
  }

  const handleDeleteDirectory = (id: string) => {
    if (hasContent(id)) {
      toast.error('目录下还有内容，无法删除')
      return
    }
    if (deleteDirectory(id)) {
      if (activeCategory === id) {
        onCategoryChange('default')
      }
      toast.success('目录删除成功')
    }
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
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button
                className="p-1 rounded-md hover:bg-black/[0.03] text-gray-500 hover:text-gray-700"
                title="新建目录"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
              <Dialog.Content
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white/95 backdrop-blur-xl rounded-lg p-6 shadow-lg border border-gray-200"
                style={{ WebkitAppRegion: 'no-drag' }}
              >
                <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
                  新建目录
                </Dialog.Title>
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    const form = e.target as HTMLFormElement
                    const name = (
                      form.elements.namedItem('name') as HTMLInputElement
                    ).value
                    handleAddDirectory(name)
                    form.reset()
                    ;(e.target as HTMLFormElement)
                      .querySelector('button[type="submit"]')
                      ?.closest('div')
                      ?.querySelector('button')
                      ?.click()
                  }}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      目录名称
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        取消
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      确定
                    </button>
                  </div>
                </form>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
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
              <div className="w-[42px]" />
            </div>
          </div>

          {/* 分类列表 */}
          {directories
            .sort((a, b) => a.order - b.order)
            .map(directory => (
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
                  {editingDirectory?.id === directory.id ? (
                    <form
                      className="flex-1 min-w-0"
                      onSubmit={e => {
                        e.preventDefault()
                        const name = (
                          e.currentTarget.elements.namedItem(
                            'name'
                          ) as HTMLInputElement
                        ).value
                        handleUpdateDirectory(directory.id, name)
                      }}
                    >
                      <input
                        type="text"
                        name="name"
                        defaultValue={editingDirectory.name}
                        className="w-full px-2 py-0.5 text-sm rounded border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
                        autoFocus
                        onBlur={() => setEditingDirectory(null)}
                      />
                    </form>
                  ) : (
                    <span className="truncate">{directory.name}</span>
                  )}
                </button>
                <div className="flex items-center gap-1 flex-shrink-0 w-[68px] justify-end">
                  <span className="text-xs text-gray-400 tabular-nums group-hover:hidden">
                    {directoryCounts[directory.id] || 0}
                  </span>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        setEditingDirectory({
                          id: directory.id,
                          name: directory.name,
                        })
                      }
                      className="p-1 rounded-md hover:bg-black/[0.03] text-gray-500 hover:text-gray-700"
                      title="编辑"
                    >
                      <PencilIcon className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteDirectory(directory.id)}
                      className="p-1 rounded-md hover:bg-black/[0.03] text-gray-500 hover:text-gray-700"
                      title="删除"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </nav>
      </div>
    </div>
  )
}
