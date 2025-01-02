import type { ReactNode } from 'react'
import { TitleBar } from '../../components/title-bar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[#fafafa]">
      <div className="h-12 flex items-center bg-white window-drag relative border-b border-gray-200">
        <div className="absolute left-0">
          <TitleBar />
        </div>
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-gray-600">ProPaste</span>
        </div>
      </div>
      <nav className="h-10 flex items-center px-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-6">
          <span className="text-sm font-medium text-gray-600">提示词</span>
          <span className="text-sm text-gray-500">工具导航</span>
        </div>
      </nav>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
