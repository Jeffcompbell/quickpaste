import { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { usePromptStore } from '@/store/prompt'
import { cn } from '@/lib/utils'
import { cursorDirectories } from '@/config/directories'
import type { Directory } from '@/types'
import { PlusIcon } from './icons'

const DEFAULT_AUTHOR = '林树'
const DEFAULT_AUTHOR_URL =
  'https://web.okjike.com/u/A5FD4BF3-680C-4199-96D0-0183B2B12F3D'

// 生成默认头像（姓名第一个字的圆形背景）
function DefaultAvatar({ name }: { name: string }) {
  const firstChar = name.charAt(0)
  return (
    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
      {firstChar}
    </div>
  )
}

interface PromptDialogProps {
  activeDirectory?: string
}

export function PromptDialog({
  activeDirectory = 'default',
}: PromptDialogProps) {
  const [open, setOpen] = useState(false)
  const { addPrompt } = usePromptStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [author, setAuthor] = useState(DEFAULT_AUTHOR)
  const [authorAvatar, setAuthorAvatar] = useState('')
  const [authorUrl, setAuthorUrl] = useState(DEFAULT_AUTHOR_URL)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [directory, setDirectory] = useState(activeDirectory)

  // 当外部目录变化时，更新内部目录状态
  useEffect(() => {
    setDirectory(activeDirectory)
  }, [activeDirectory])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    addPrompt({
      type: 'product',
      id: crypto.randomUUID(),
      title,
      content,
      category: directory,
      directory,
      order: Date.now(),
      author,
      authorAvatar: '',
      authorUrl,
    })

    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setTitle('')
    setContent('')
    setAuthor(DEFAULT_AUTHOR)
    setAuthorAvatar('')
    setAuthorUrl(DEFAULT_AUTHOR_URL)
    setShowAdvanced(false)
    setDirectory(activeDirectory) // 重置为当前选中的目录
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件')
        return
      }
      if (file.size > 1024 * 1024) {
        alert('图片大小不能超过 1MB')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setAuthorAvatar(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-4 h-9 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          <span>新建提示词</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/10 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-lg shadow-lg border border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              新建提示词
            </Dialog.Title>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form
              id="prompt-form"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  内容
                </label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900 min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  目录
                </label>
                <select
                  value={directory}
                  onChange={e => setDirectory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900"
                >
                  {cursorDirectories.map((dir: Directory) => (
                    <option key={dir.id} value={dir.id}>
                      {dir.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="group flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
                >
                  <svg
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      showAdvanced ? 'rotate-180' : ''
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-600 group-hover:text-gray-900">
                    更多配置
                  </span>
                </button>

                <div
                  className={cn(
                    'grid transition-all duration-200',
                    showAdvanced
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          作者
                        </label>
                        <input
                          type="text"
                          value={author}
                          onChange={e => setAuthor(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900"
                          placeholder={DEFAULT_AUTHOR}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          作者头像
                        </label>
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={handleImageClick}
                            className={cn(
                              'w-20 h-20 rounded-full border-2 border-dashed border-gray-300',
                              'flex items-center justify-center hover:bg-gray-50 transition-colors',
                              authorAvatar && 'border-none'
                            )}
                          >
                            {authorAvatar ? (
                              <img
                                src={authorAvatar}
                                alt="作者头像"
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <DefaultAvatar name={author} />
                            )}
                          </button>
                          <div className="flex-1 text-sm text-gray-500">
                            <p>点击上传头像</p>
                            <p>支持 JPG、PNG 格式，大小不超过 1MB</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          作者主页 URL
                        </label>
                        <input
                          type="url"
                          value={authorUrl}
                          onChange={e => setAuthorUrl(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors text-gray-900"
                          placeholder={DEFAULT_AUTHOR_URL}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex justify-end space-x-2">
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
                form="prompt-form"
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
