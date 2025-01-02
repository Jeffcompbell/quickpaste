import { PanelLeftIcon } from './icons'

export function Header() {
  const handlePanelClick = () => {
    if (!window.electron) return
    window.electron.window.togglePanel()
  }

  return (
    <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <button
          className="p-2 hover:bg-accent rounded-md"
          onClick={handlePanelClick}
        >
          <PanelLeftIcon className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-semibold">提示词</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-sm text-gray-500 hover:text-gray-700">
          提示词
        </button>
        <button className="text-sm text-gray-500 hover:text-gray-700">
          工具导航
        </button>
      </div>
    </header>
  )
}
