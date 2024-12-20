import { useCallback, useEffect, useState } from 'react'
import { getElectronAPI } from '@/lib/electron'

const isMac = process.platform === 'darwin'

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)
  const electron = getElectronAPI()

  useEffect(() => {
    electron.window.getMaximizedState().then(setIsMaximized)

    // 监听窗口最大化状态变化
    const handleMaximizedChange = (event: MessageEvent) => {
      if (event.data.type === 'window:maximized') {
        setIsMaximized(event.data.isMaximized)
      }
    }

    window.addEventListener('message', handleMaximizedChange)
    const cleanup = () =>
      window.removeEventListener('message', handleMaximizedChange)
    return cleanup
  }, [electron.window])

  const handleMinimize = useCallback(() => {
    console.log('Minimizing window...')
    electron.window.minimize()
  }, [electron.window])

  const handleMaximize = useCallback(() => {
    console.log('Toggling maximize state...', isMaximized)
    if (isMaximized) {
      electron.window.restore()
    } else {
      electron.window.maximize()
    }
  }, [isMaximized, electron.window])

  const handleClose = useCallback(() => {
    console.log('Closing window...')
    electron.window.close()
  }, [electron.window])

  if (isMac) {
    // macOS: 只显示标题和拖拽区域
    return (
      <div className="h-12 flex items-center justify-center bg-black/50 backdrop-blur-xl border-b border-white/[0.06] draggable">
        <h1 className="text-xs font-medium text-white/50">Quick Paste</h1>
      </div>
    )
  }

  // Windows: 显示自定义窗口控制按钮
  return (
    <div className="h-8 flex items-center justify-between bg-black/50 backdrop-blur-xl border-b border-white/[0.06] draggable">
      <div className="flex items-center space-x-2 px-3 undraggable">
        <button
          onClick={handleClose}
          className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors"
          title="关闭"
        />
        <button
          onClick={handleMinimize}
          className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 transition-colors"
          title="最小化"
        />
        <button
          onClick={handleMaximize}
          className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors"
          title={isMaximized ? '还原' : '最大化'}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-xs font-medium text-white/50">Quick Paste</h1>
      </div>
    </div>
  )
}
