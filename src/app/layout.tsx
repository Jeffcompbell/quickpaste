import { ReactNode, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
}

const isMac = process.platform === 'darwin'

export function Layout({ children }: LayoutProps) {
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
        !isMaximized && 'rounded-2xl overflow-hidden'
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
          'h-12 flex items-center justify-center',
          'app-drag-region',
          isMac ? 'pl-20' : 'pl-4'
        )}
      >
        <h1 className="text-sm font-medium text-gray-500 select-none pointer-events-none">
          Quick Paste
        </h1>
      </div>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
