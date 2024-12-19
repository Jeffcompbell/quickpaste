import { CursorPrompt } from '@/types'
import { CopyIcon, EditIcon, TrashIcon } from './icons'
import { getElectronAPI } from '@/lib/electron'
import { toast } from 'react-hot-toast'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export function CursorPromptItem({
  prompt,
  onEdit,
  onDelete,
}: {
  prompt: CursorPrompt
  onEdit: (prompt: CursorPrompt) => void
  onDelete: (id: string) => void
}) {
  const electron = getElectronAPI()

  const handleCopy = () => {
    electron.clipboard.writeText(prompt.content)
    toast.success('已复制到剪贴板')
  }

  return (
    <div className="p-4 rounded-lg border border-white/[0.06] bg-black/30 hover:bg-white/[0.02] transition-colors cursor-pointer group">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{prompt.title}</h3>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="min-w-[160px] bg-popover text-popover-foreground rounded-md p-1 shadow-md">
              <DropdownMenu.Item
                className="flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer"
                onClick={handleCopy}
              >
                <CopyIcon className="w-4 h-4 mr-2" />
                复制
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer"
                onClick={() => onEdit(prompt)}
              >
                <EditIcon className="w-4 h-4 mr-2" />
                编辑
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className="flex items-center px-2 py-1.5 text-sm rounded-sm hover:bg-accent cursor-pointer text-destructive"
                onClick={() => onDelete(prompt.id)}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                删除
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
        {prompt.content}
      </p>
    </div>
  )
}
