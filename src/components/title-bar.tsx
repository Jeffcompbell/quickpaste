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
    <div className="h-8 flex items-center justify-between webkit-app-region-drag bg-transparent">
      {/* macOS 红绿灯占位，不需要实际按钮，系统会自动显示 */}
      <div className="flex-1 h-full" />
    </div>
  )
}
