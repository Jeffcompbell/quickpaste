import type { ReactNode } from 'react'
import { TitleBar } from '../../components/title-bar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <TitleBar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
