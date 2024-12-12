import { usePromptStore } from '@/store/prompt'
import { PromptDialog } from './prompt-dialog'

export function Header() {
  const { isCompact } = usePromptStore()

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
      <h2 className="text-lg font-semibold">提示词</h2>
      {!isCompact && <PromptDialog />}
    </div>
  )
}
