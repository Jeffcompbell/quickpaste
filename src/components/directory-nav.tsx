import { cn } from '@/lib/utils'

const directories = [
  {
    id: 'default',
    name: '默认',
  },
  {
    id: 'custom',
    name: '自定义',
  },
] as const

interface DirectoryNavProps {
  activeDir: string
  onChange: (dir: string) => void
}

export function DirectoryNav({ activeDir, onChange }: DirectoryNavProps) {
  return (
    <div className="w-[160px] border-r border-border/50 pr-4">
      <h2 className="text-sm font-medium text-muted-foreground mb-2">目录</h2>
      <div className="space-y-1">
        {directories.map(dir => (
          <button
            key={dir.id}
            className={cn(
              'w-full px-3 py-1.5 text-sm rounded-md text-left transition-colors',
              'hover:bg-accent/50',
              activeDir === dir.id
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground'
            )}
            onClick={() => onChange(dir.id)}
          >
            {dir.name}
          </button>
        ))}
      </div>
    </div>
  )
}
