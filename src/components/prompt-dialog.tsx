import { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { usePromptStore } from '@/store/prompt'
import { useDirectoryStore } from '@/store/directory'
import { productDirectories } from '@/config/directories'
import { cn } from '@/lib/utils'
import { PlusIcon } from './icons'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const DEFAULT_AUTHOR = '林树'
const DEFAULT_AUTHOR_URL =
  'https://web.okjike.com/u/A5FD4BF3-680C-4199-96D0-0183B2B12F3D'

// 定义表单验证 schema
const promptFormSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  content: z.string().min(1, '内容不能为空'),
  directory: z.string(),
  author: z.string().optional(),
  authorUrl: z.string().url().optional(),
  authorAvatar: z.string().optional(),
})

type PromptFormValues = z.infer<typeof promptFormSchema>

export function PromptDialog({
  activeDirectory = 'default',
}: {
  activeDirectory: string
}) {
  const [open, setOpen] = useState(false)
  const { addPrompt } = usePromptStore()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { directories } = useDirectoryStore()

  const form = useForm<PromptFormValues>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: '',
      content: '',
      directory: activeDirectory,
      author: DEFAULT_AUTHOR,
      authorUrl: DEFAULT_AUTHOR_URL,
      authorAvatar: '',
    },
  })

  // 当外部目录变化时，更新表单目录值
  useEffect(() => {
    form.setValue('directory', activeDirectory)
  }, [activeDirectory, form])

  const onSubmit = form.handleSubmit((values: PromptFormValues) => {
    addPrompt({
      type: 'product',
      title: values.title,
      content: values.content,
      directory: values.directory,
      category: values.directory,
      author: values.author || 'Anonymous',
      authorUrl: values.authorUrl || '',
      authorAvatar: values.authorAvatar || '',
    })

    setOpen(false)
    form.reset()
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('请上传图片文件')
        return
      }
      if (file.size > 1024 * 1024) {
        toast.error('图片大小不能超过 1MB')
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        form.setValue('authorAvatar', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 获取当前目录的名称
  const getDirectoryName = (id: string) => {
    // 先查找系统目录
    const systemDir = productDirectories.find(dir => dir.id === id)
    if (systemDir) return systemDir.name

    // 再查找自定义目录
    const customDir = directories.find(dir => dir.id === id)
    if (customDir) return customDir.name

    return id
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

          <form onSubmit={onSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  标题
                </label>
                <input
                  {...form.register('title')}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  内容
                </label>
                <textarea
                  {...form.register('content')}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors min-h-[100px]"
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  目录
                </label>
                <input
                  type="text"
                  value={getDirectoryName(form.watch('directory'))}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors"
                  readOnly
                />
              </div>

              {/* 高级选项 */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {showAdvanced ? '隐藏高级选项' : '显示高级选项'}
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      作者
                    </label>
                    <input
                      {...form.register('author')}
                      className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      作者链接
                    </label>
                    <input
                      {...form.register('authorUrl')}
                      className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white focus:border-gray-300 focus:ring-1 focus:ring-gray-300 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      作者头像
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-300 transition-colors"
                    >
                      {form.watch('authorAvatar') ? (
                        <img
                          src={form.watch('authorAvatar')}
                          alt="Author"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <PlusIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
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
  )
}
