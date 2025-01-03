import { useEffect } from 'react'
import { getElectronAPI } from '../lib/electron'

export function TitleBar() {
  const electron = getElectronAPI()

  useEffect(() => {
    // 初始化窗口状态
    async function initWindowState() {
      if (electron?.window) {
        await electron.window.getMaximizedState()
      }
    }

    initWindowState()
  }, [electron])

  return (
    <div className="flex items-center">
      <button
        className="p-2 hover:bg-accent rounded-md"
        onClick={() => electron?.window.togglePanel()}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
    </div>
  )
}
