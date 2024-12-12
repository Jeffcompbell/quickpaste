import { ReactNode } from 'react'
import { TitleBar } from '@/components/title-bar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background/95 backdrop-blur-md rounded-lg overflow-hidden border border-border/50 shadow-lg">
      <TitleBar />
      <main className="flex-1 p-4 overflow-auto">{children}</main>
    </div>
  )
}
