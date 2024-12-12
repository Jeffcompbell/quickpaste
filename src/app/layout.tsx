import { TitleBar } from '@/components/title-bar'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      <TitleBar />
      <main className="flex-1 p-4 overflow-y-auto">{children}</main>
    </div>
  )
}
