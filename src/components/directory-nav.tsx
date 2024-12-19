import { cn } from '@/lib/utils'
import type { Directory } from '@/types'
import { cursorDirectories, productDirectories } from '@/config/directories'

interface DirectoryNavProps {
  activeDir: string
  onChange: (dir: string) => void
  type?: 'cursor' | 'product'
}

export function DirectoryNav({
  activeDir,
  onChange,
  type = 'cursor',
}: DirectoryNavProps) {
  const directories =
    type === 'product' ? productDirectories : cursorDirectories

  return (
    <div className="w-48 space-y-1">
      {directories.map(dir => (
        <button
          key={dir.id}
          onClick={() => onChange(dir.id)}
          className={cn(
            'w-full flex items-center px-4 py-2 text-sm rounded-lg',
            'hover:bg-accent transition-colors',
            activeDir === dir.id
              ? 'bg-accent font-medium'
              : 'text-muted-foreground'
          )}
        >
          {dir.icon && <span className="mr-2">{dir.icon}</span>}
          <span>{dir.name}</span>
        </button>
      ))}
    </div>
  )
}
