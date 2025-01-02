import { ReactNode, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
  className?: string
}

const isMac = process.platform === 'darwin'

export function Layout({ children, className }: LayoutProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const handleMaximizedChange = (event: MessageEvent) => {
      if (event.data.type === 'window:maximized') {
        setIsMaximized(event.data.isMaximized)
      }
    }

    window.addEventListener('message', handleMaximizedChange)
    return () => window.removeEventListener('message', handleMaximizedChange)
  }, [])

  return (
    <div
      className={cn(
        'flex flex-col h-screen',
        'backdrop-blur-2xl',
        !isMaximized && 'rounded-2xl overflow-hidden',
        className
      )}
      style={{
        background:
          'linear-gradient(135deg, rgba(247, 248, 249, 0.95), rgba(251, 252, 253, 0.85))',
        boxShadow:
          '0 2px 24px -1px rgba(0, 0, 0, 0.05), 0 0 1px 0 rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <div
        className={cn(
          'h-8 w-full bg-white border-b border-gray-200 flex items-center justify-center select-none',
          'app-drag-region',
          isMac ? 'pl-20' : 'pl-4'
        )}
        style={{ WebkitAppRegion: 'drag' }}
      >
        <span className="text-sm text-gray-600">ProPaste</span>
      </div>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
